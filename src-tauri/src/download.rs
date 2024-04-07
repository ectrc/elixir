use std::{path::PathBuf, time::Duration};

use std::cmp::min;
use std::fs::{File, OpenOptions};
use std::io::Write;

use serde::{Deserialize, Serialize};

use tauri::{AppHandle, Manager};

use futures_util::StreamExt;
use indicatif::{ProgressBar, ProgressStyle};
use unrar::Archive;

const RETRY_DELAY_SECONDS: u64 = 5;
const MAX_RETRIES: i64 = 5;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Progress {
    pub download_id: i64,
    pub filesize: u64,
    pub transfered: u64,
    pub transfer_rate: f64,
    pub percentage: f64,
    pub comment: String,
}

impl Progress {
    pub fn emit_progress(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_PROGRESS", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_FINISHED", &self).ok();
    }
}

fn truncate_path(s: &str) -> String {
    if let Some(pos) = s.rfind('/') {
        return s[..pos].to_string();
    }
    s.to_string()
}

#[tauri::command]
pub async fn check_game_exists(path: &str) -> Result<bool, String> {
    let game_path = PathBuf::from(path);
    let mut game = game_path.clone();
    game.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe");

    if !game.exists() {
        return Err("Hmmm could not find all Fortnite files".to_string());
    } else {
        Ok(true)
    }
}

fn unpack_rar_file(rar_path: &str) -> Result<(), String> {
    // Check if the RAR file exists
    let rar_file = std::path::Path::new(rar_path);

    println!("File: {}", rar_path);

    if !rar_file.exists() {
        return Err(format!("RAR file not found: {}", rar_path));
    }

    let path = truncate_path(rar_path);

    let mut archive = Archive::new(rar_path).open_for_processing().unwrap();
    while let Some(header) = archive
        .read_header()
        .map_err(|e| format!("Failed to read header: {}", e))?
    {
        println!(
            "{} bytes: {}",
            header.entry().unpacked_size,
            header.entry().filename.to_string_lossy(),
        );

        archive = if header.entry().is_file() {
            let path_file = std::path::Path::new(&path).join(header.entry().filename.as_path());
            header
                .extract_to(path_file.as_path())
                .map_err(|e| format!("Failed to extract: {}", e))?
        } else {
            header
                .skip()
                .map_err(|e| format!("Failed to skip: {}", e))?
        };
    }
    std::fs::remove_file(rar_file).expect("Could not delete rar file");
    Ok(())
}

#[tauri::command]
pub fn eccentric_unrar_method(rar_path: &str) -> Result<(), String> {
    let rar_file = std::path::Path::new(rar_path);
    if !rar_file.exists() {
        return Err(format!("RAR file not found: {}", rar_path));
    }

    let mut archive = Archive::new(rar_path).open_for_processing().unwrap();
    while let Some(header) = archive.read_header().unwrap() {
        println!(
            "{} bytes: {}",
            header.entry().unpacked_size,
            header.entry().filename.to_string_lossy(),
        );

        archive = if header.entry().is_file() {
            let path_file = std::path::Path::new(&rar_path)
                .parent()
                .unwrap()
                .join(header.entry().filename.as_path());
            header
                .extract_to(path_file.as_path())
                .map_err(|e| format!("Failed to extract: {}", e))?
        } else {
            header
                .skip()
                .map_err(|e| format!("Failed to skip: {}", e))?
        };
    }
    std::fs::remove_file(rar_file).expect("Could not delete rar file");
    Ok(())
}

#[tauri::command]
pub async fn download_build_file(
    url: &str,
    path: &str,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let client = reqwest::Client::new();

    let mut retries = 0;

    loop {
        if let Err(err) = downloader(client.clone(), url, path, retries, handle.clone()).await {
            retries += 1;
            eprintln!("{}", err);
            eprintln!("Download failed");
            std::thread::sleep(Duration::from_secs(RETRY_DELAY_SECONDS));

            if retries >= MAX_RETRIES {
                return Err("Exceeded maximum download retries.".to_string());
            }
        } else {
            println!("All done");
            return Ok(());
        }
    }
}

async fn downloader(
    client: reqwest::Client,
    url: &str,
    path: &str,
    retries: i64,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    if retries > 0 {
        eprintln!("Trying download again...");

        let mut progress = Progress {
            download_id: 1,
            filesize: 0,
            transfered: 0,
            transfer_rate: 0.0,
            percentage: 0.0,
            comment: "".to_string(),
        };

        let start_time = std::time::Instant::now();

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .or(Err(format!("Failed to open file '{}'", path)))?;

        let mut request_builder = client.get(url);

        let metadata = file
            .metadata()
            .or(Err(format!("Failed to get file metadata for '{}'", path)))?;
        let file_size = metadata.len();

        progress.transfered = file_size;

        let range_header_value = format!("bytes={}-", file_size);
        request_builder = request_builder.header("Range", range_header_value);

        let res: reqwest::Response = request_builder
            .send()
            .await
            .or(Err(format!("Failed to GET from '{}'", &url)))?;

        if !res.status().is_success() {
            return Err("Error while downloading".to_string());
        }

        let total_size = res
            .content_length()
            .ok_or(format!("Failed to get content length from '{}'", &url))?;

        progress.filesize = total_size;

        let pb = ProgressBar::new(total_size);
        pb.set_style(ProgressStyle::default_bar()
        .template("{msg}\n{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})")
        .progress_chars("#>-"));
        pb.set_message(&format!("Downloading {}", url));

        let mut downloaded: u64 = 0;
        let mut stream = res.bytes_stream();

        while let Some(item) = stream.next().await {
            let chunk = item.or(Err(format!("Error while downloading file")))?;
            file.write_all(&chunk)
                .or(Err(format!("Error while writing to file")))?;

            let new = min(downloaded + (chunk.len() as u64), total_size);

            downloaded = new;
            progress.transfered = downloaded;
            progress.percentage = (progress.transfered * 100 / total_size) as f64;
            progress.transfer_rate = (downloaded as f64) / (start_time.elapsed().as_secs() as f64)
                + (start_time.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

            pb.set_position(new);

            if start_time.elapsed().as_secs() > 0 && start_time.elapsed().as_secs() % 3 == 0 {
                progress.emit_progress(&handle);
            }
        }

        if progress.transfered == total_size {
            progress.comment = "Extracting rar...".to_string();
            match unpack_rar_file(path) {
                Ok(()) => println!("RAR file unpacked successfully."),
                Err(e) => eprintln!("[ERROR] {}", e),
            }

            progress.emit_finished(&handle);
        } else {
            return Err("Error while downloading".to_string());
        }
    } else {
        let mut progress = Progress {
            download_id: 1,
            filesize: 0,
            transfered: 0,
            transfer_rate: 0.0,
            percentage: 0.0,
            comment: "".to_string(),
        };

        let start_time = std::time::Instant::now();

        if std::path::Path::new(path).exists() {
            println!("File exists");
            let mut file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(path)
                .or(Err(format!("Failed to open file '{}'", path)))?;

            let mut request_builder = client.get(url);

            let metadata = file
                .metadata()
                .or(Err(format!("Failed to get file metadata for '{}'", path)))?;
            let file_size = metadata.len();

            progress.transfered = file_size;

            let range_header_value = format!("bytes={}-", file_size);
            request_builder = request_builder.header("Range", range_header_value);

            let res: reqwest::Response = request_builder
                .send()
                .await
                .or(Err(format!("Failed to GET from '{}'", &url)))?;

            if res.content_length().is_none() {
                println!("File already done");
                progress.comment = "Extracting rar...".to_string();
                match unpack_rar_file(path) {
                    Ok(()) => println!("RAR file unpacked successfully."),
                    Err(e) => eprintln!("[ERROR] {}", e),
                }
                progress.emit_finished(&handle);
                return Ok(());
            }

            let total_size = res
                .content_length()
                .ok_or(format!("Failed to get content length from '{}'", &url))?;

            progress.filesize = total_size;

            if progress.transfered == total_size {
                progress.comment = "Extracting rar...".to_string();
                match unpack_rar_file(path) {
                    Ok(()) => println!("RAR file unpacked successfully."),
                    Err(e) => eprintln!("[ERROR] {}", e),
                }

                return Ok(());
            }

            let pb = ProgressBar::new(total_size);
            pb.set_style(ProgressStyle::default_bar().template("{msg}\n{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})").progress_chars("#>-"));
            pb.set_message(&format!("Downloading {}", url));

            let mut downloaded: u64 = 0;
            let mut stream = res.bytes_stream();

            while let Some(item) = stream.next().await {
                let chunk = item.or(Err(format!("Error while downloading file")))?;
                file.write_all(&chunk)
                    .or(Err(format!("Error while writing to file")))?;

                let new = min(downloaded + (chunk.len() as u64), total_size);

                downloaded = new;
                progress.transfered = downloaded;
                progress.percentage = (progress.transfered * 100 / total_size) as f64;
                progress.transfer_rate = (downloaded as f64)
                    / (start_time.elapsed().as_secs() as f64)
                    + (start_time.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

                pb.set_position(new);

                if start_time.elapsed().as_secs() > 0 && start_time.elapsed().as_secs() % 3 == 0 {
                    progress.emit_progress(&handle);
                }
            }

            println!("UNPACKING");
            progress.comment = "Extracting rar...".to_string();
            match unpack_rar_file(path) {
                Ok(()) => println!("RAR file unpacked successfully."),
                Err(e) => eprintln!("[ERROR] {}", e),
            }

            progress.emit_finished(&handle);
        } else {
            let res: reqwest::Response = client
                .get(url)
                .send()
                .await
                .or(Err(format!("Failed to GET from '{}'", &url)))?;

            if !res.status().is_success() {
                return Err("Error while downloading".to_string());
            }

            let total_size = res
                .content_length()
                .ok_or(format!("Failed to get content length from '{}'", &url))?;

            progress.filesize = total_size;

            // Indicatif setup
            let pb = ProgressBar::new(total_size);
            pb.set_style(ProgressStyle::default_bar()
        .template("{msg}\n{spinner:.green} [{elapsed_precise}] [{wide_bar:.cyan/blue}] {bytes}/{total_bytes} ({bytes_per_sec}, {eta})")
        .progress_chars("#>-"));
            pb.set_message(&format!("Downloading {}", url));

            let mut file =
                File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
            let mut downloaded: u64 = 0;
            let mut stream = res.bytes_stream();

            while let Some(item) = stream.next().await {
                let chunk = match item {
                    Ok(data) => data,
                    Err(err) => {
                        eprintln!("Error while downloading file: {}", err);
                        return Err("Error while downloading".to_string());
                    }
                };
                file.write_all(&chunk)
                    .or(Err(format!("Error while writing to file")))?;
                let new = min(downloaded + (chunk.len() as u64), total_size);
                downloaded = new;
                progress.transfered = downloaded;
                progress.percentage = (progress.transfered * 100 / total_size) as f64;
                progress.transfer_rate = (downloaded as f64)
                    / (start_time.elapsed().as_secs() as f64)
                    + (start_time.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

                pb.set_position(new);

                if start_time.elapsed().as_secs() > 0 && start_time.elapsed().as_secs() % 3 == 0 {
                    progress.emit_progress(&handle);
                }
            }

            progress.comment = "Extracting rar...".to_string();
            match unpack_rar_file(path) {
                Ok(()) => println!("RAR file unpacked successfully."),
                Err(e) => eprintln!("[ERROR] {}", e),
            }

            progress.emit_finished(&handle);
        }
    }

    return Ok(());
}
