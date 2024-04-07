use std::fs::{self, File};
use std::io::Write;
use std::{cmp::min, path::PathBuf};

use serde::{Deserialize, Serialize};

use tauri::{AppHandle, Manager};

use futures_util::StreamExt;
use indicatif::{ProgressBar, ProgressStyle};

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
        handle.emit_all("DOWNLOAD_PROGRESS_PAK", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_FINISHED_PAK", &self).ok();
    }
}

#[tauri::command]
pub async fn download_paks(
    base_url: &str,
    file_name: &str,
    path: &str,
    handle: tauri::AppHandle,
) -> Result<bool, String> {
    let client = reqwest::Client::new();
    let file_url = format!("{}/{}", base_url, file_name);

    if let Err(err) = downloader(client.clone(), file_name, &file_url, path, handle.clone()).await {
        eprintln!("{}", err);
        return Err(format!("Error while downloading file: {}", file_name));
    } else {
        println!("Downloaded {}", file_name);
        return Ok(true);
    }
}

#[tauri::command]
pub async fn check_pak_exists(path: &str, file_name: &str) -> Result<bool, String> {
    let file_path = PathBuf::from(path);
    let mut file = file_path.clone();
    let pak_path = format!("FortniteGame\\Content\\Paks\\{}", file_name);

    file.push(pak_path);

    if !file.exists() {
        Ok(false)
    } else {
        Ok(true)
    }
}

#[tauri::command]
pub async fn get_file_size(path: &str) -> Result<u64, String> {
    let file_path = PathBuf::from(path);

    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    let file_size = fs::metadata(file_path).unwrap().len();

    Ok(file_size)
}

#[tauri::command]
pub async fn check_file_exists(path: &str) -> Result<bool, String> {
    let file_path = PathBuf::from(path);

    if !file_path.exists() {
        Ok(false)
    } else {
        Ok(true)
    }
}

async fn downloader(
    client: reqwest::Client,
    file_name: &str,
    url: &str,
    path: &str,
    handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut progress = Progress {
        download_id: 1,
        filesize: 0,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
        comment: "".to_string(),
    };

    let start_time = std::time::Instant::now();

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

    let mut file = File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
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
        progress.transfer_rate = (downloaded as f64) / (start_time.elapsed().as_secs() as f64)
            + (start_time.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

        pb.set_position(new);

        if start_time.elapsed().as_secs() > 0 && start_time.elapsed().as_secs() % 3 == 0 {
            progress.emit_progress(&handle);
        }
    }

    progress.comment = format!("{} is finished", file_name);

    progress.emit_finished(&handle);
    return Ok(());
}
