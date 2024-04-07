// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use regex::Regex;
use sha2::{Digest, Sha256};
use tauri::{Manager, WindowEvent};
use window_shadows::set_shadow;

use std::os::windows::process::CommandExt;
use std::{path::PathBuf, process::Stdio};
use tokio::runtime::Runtime;

use sysinfo::{System, SystemExt};

mod download;
mod download2;
mod process;

const SCHEME: &str = "elixir";
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
fn start_elixir(
    folder_path: String,
    exchange_code: String,
    is_dev: bool,
    app: tauri::AppHandle,
) -> Result<bool, String> {
    process::kill_all();
    let game_path = PathBuf::from(folder_path);

    if !is_dev {
        let mut game_dll = game_path.clone();
        game_dll.push(
            "Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll",
        );

        if game_dll.exists() {
            loop {
                let mut game_dll2 = game_path.clone();
                game_dll2.push("Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll");

                if std::fs::remove_file(game_dll2).is_ok() {
                    break;
                }

                std::thread::sleep(std::time::Duration::from_millis(100));
            }
        }

        let mut game_dll = game_path.clone();
        game_dll.push(
            "Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll",
        );

        let download_res = Runtime::new().unwrap().block_on(download2::download_paks(
            "https://builds.elixirfn.com",
            "Elixir.Client.dll",
            game_dll.to_str().unwrap(),
            app,
        ));

        if download_res.is_err() {
            return Err("Hmmm could not download Elixir Client".to_string());
        }
    }

    let mut eac_setup = game_path.clone();
    eac_setup.push("EasyAntiCheat\\EasyAntiCheat_EOS_Setup.exe");

    if !eac_setup.exists() {
        return Err("Hmmm could not find EAC setup".to_string());
    }

    let sting = eac_setup.to_str().unwrap().to_string();
    let setup_args = vec!["/C", &sting, "install", "b2504259773b40e3a818f820e31979ca"];
    let cmd = std::process::Command::new("cmd")
        .creation_flags(CREATE_NO_WINDOW)
        .args(&setup_args)
        .stdout(Stdio::piped())
        .spawn();

    if cmd.is_err() {
        return Err("Hmmm could not start EAC setup".to_string());
    }

    let mut game_real = game_path.clone();
    game_real.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe");

    let mut game_eac = game_path.clone();
    game_eac.push("Elixir_EAC.exe");

    if !game_eac.exists() || !game_real.exists() {
        return Err("Hmmm could not find all Fortnite files".to_string());
    }

    let exchange_arg = &format!("-AUTH_PASSWORD={}", exchange_code);
    process::start_launcher(&game_path);
    process::start_ac(&game_path);

    let fort_args = vec![
        "-epicapp=Fortnite",
        "-epicenv=Prod",
        "-epiclocale=en-us",
        "-epicportal",
        "-nobe",
        "-fromfl=eac",
        "-fltoken=24963ce04b575a5ca65526h0",
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQ",
        "-skippatchcheck",
        "-AUTH_LOGIN=", exchange_arg,
        "-AUTH_TYPE=exchangecode",
    ];

    let x = std::process::Command::new(game_eac)
        .creation_flags(0x00000008)
        .args(&fort_args)
        .stdout(Stdio::piped())
        .spawn();

    if x.is_err() {
        return Err("Hmmm could not start Elixir".to_string());
    }

    // while epic games launcher is alive, kill it

    let mut system = System::new_all();
    loop {
        system.refresh_all();

        let x = system.processes_by_name("EpicGamesLauncher.exe");

        if x.count() == 0 {
            break;
        }

        process::kill_epic_games();
    } // MAKE SURE EPIC GAMES LAUNCHER IS DEAD

    return Ok(true);
}

#[tauri::command]
async fn calculate_sha256_of_file(file_path: String) -> Result<String, String> {
    let file_path = PathBuf::from(file_path);

    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    let bytes = std::fs::read(file_path).unwrap();
    let hash = Sha256::digest(&bytes);
    return Ok(format!("{:x}", hash));
}

fn main() {
    tauri_plugin_deep_link::prepare("com.elixirfn.prod");

    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");

            window.on_window_event(|event| match event {
                WindowEvent::Resized(..) => std::thread::sleep(std::time::Duration::from_nanos(1)),
                _ => {}
            });

            tauri_plugin_deep_link::register(SCHEME, move |request| {
                let re = Regex::new(r"elixir://([^/]+)").unwrap();

                if let Err(err) = window.set_focus() {
                    eprintln!("Could not set focus on main window: {:?}", err);
                }

                if let Some(captures) = re.captures(request.as_str()) {
                    // Extract the captured group
                    if let Some(result) = captures.get(1) {
                        window
                            .eval(&format!("window.location.hash = '{}'", result.as_str()))
                            .unwrap();
                    }
                }
            })
            .unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            process::get_all_tasks,
            process::manual_map,
            process::get_current_directory,
            download::check_game_exists,
            download::eccentric_unrar_method,
            download::download_build_file,
            download2::check_pak_exists,
            download2::get_file_size,
            download2::download_paks,
            download2::check_file_exists,
            start_elixir,
            calculate_sha256_of_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
