use std::collections::HashSet;
use std::env;
use tasklist;

use std::path::PathBuf;
use std::process::Command;

use winapi::shared::minwindef::FALSE;
use winapi::um::handleapi::CloseHandle;
use winapi::um::processthreadsapi::{OpenThread, SuspendThread};
use winapi::um::tlhelp32::{
    CreateToolhelp32Snapshot, Thread32First, Thread32Next, TH32CS_SNAPTHREAD, THREADENTRY32,
};

use winapi::um::winnt::HANDLE;
use winapi::um::winnt::THREAD_SUSPEND_RESUME;

use sysinfo::{System, SystemExt};

#[tauri::command]
pub async fn get_all_tasks() -> Vec<String> {
    tauri::async_runtime::spawn(async move {
        let mut tasks = Vec::new();

        unsafe {
            let tl = tasklist::Tasklist::new();

            for task in tl {
                tasks.push(task.get_pname());
            }
        }

        let set: HashSet<_> = tasks.drain(..).collect();
        tasks.extend(set.into_iter());
        tasks.sort();

        tasks
    })
    .await
    .unwrap()
}

#[tauri::command]
pub async fn manual_map(library_path: String, process_name: String) -> bool {
    println!("Loading library: {}", library_path);
    println!("Process name: {}", process_name);

    let mut pid = 0;
    unsafe {
        let tl = tasklist::Tasklist::new();

        for task in tl {
            if task.get_pname() == process_name {
                pid = task.get_pid();
                break;
            }
        }
    }

    if pid == 0 {
        return false;
    }

    let res = dll_injector::inject_dll_load_library(pid, &library_path);
    println!("Injection result: {}", res.is_err());

    if res.is_err() {
        println!("Injection error: {}", res.err().unwrap());
        return false;
    }

    true
}

#[tauri::command]
pub async fn get_current_directory() -> String {
    let path = env::current_dir();

    path.unwrap().display().to_string()
}

pub fn kill_all() {
    let mut system = System::new_all();
    system.refresh_all();

    let processes = vec![
        "EpicGamesLauncher.exe",
        "FortniteLauncher.exe",
        "FortniteClient-Win64-Shipping_EAC.exe",
        "FortniteClient-Win64-Shipping.exe",
        "EasyAntiCheat_EOS.exe",
        "EpicWebHelper.exe",
    ];

    for process in processes.iter() {
        let mut cmd = Command::new("taskkill");
        cmd.arg("/F");
        cmd.arg("/IM");
        cmd.arg(process);
        cmd.output().unwrap();
    }
}

pub fn kill_epic_games() {
    let mut system = System::new_all();
    system.refresh_all();

    let processes = vec!["EpicGamesLauncher.exe"];

    for process in processes.iter() {
        let mut cmd = Command::new("taskkill");
        cmd.arg("/F");
        cmd.arg("/IM");
        cmd.arg(process);
        cmd.output().unwrap();
    }
}

pub fn start_ac(path: &PathBuf) {
    let mut ac_path = PathBuf::from(&path);

    ac_path.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping_EAC.exe");

    let mut cwd = PathBuf::from(&path);
    cwd.push("FortniteGame\\Binaries\\Win64");

    let process = Command::new(ac_path).current_dir(&cwd).spawn().unwrap();

    suspend_process(process.id());
}

pub fn start_launcher(path: &PathBuf) {
    let mut launcher_path = PathBuf::from(&path);
    launcher_path.push("FortniteGame\\Binaries\\Win64\\FortniteLauncher.exe");

    let mut cwd = PathBuf::from(&path);
    cwd.push("FortniteGame\\Binaries\\Win64");

    let process = Command::new(launcher_path)
        .current_dir(&cwd)
        .spawn()
        .unwrap();

    suspend_process(process.id());
}

pub fn suspend_process(pid: u32) -> (u32, bool) {
    unsafe {
        let mut has_err = false;
        let mut count: u32 = 0;

        let te: &mut THREADENTRY32 = &mut std::mem::zeroed();
        (*te).dwSize = std::mem::size_of::<THREADENTRY32>() as u32;

        let snapshot: HANDLE = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);

        if Thread32First(snapshot, te) == 1 {
            loop {
                if pid == (*te).th32OwnerProcessID {
                    let tid = (*te).th32ThreadID;

                    let thread: HANDLE = OpenThread(THREAD_SUSPEND_RESUME, FALSE, tid);
                    has_err |= SuspendThread(thread) as i32 == -1i32;

                    CloseHandle(thread);
                    count += 1;
                }

                if Thread32Next(snapshot, te) == 0 {
                    break;
                }
            }
        }

        CloseHandle(snapshot);

        (count, has_err)
    }
}
