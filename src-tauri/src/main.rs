use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;
use chrono::NaiveDate;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ClothingItem {
    name: String,
    cost: f64,
    uses: Vec<NaiveDate>,
}

struct AppState {
    clothing_items: Mutex<Vec<ClothingItem>>,
}

fn get_data_file_path() -> PathBuf {
    let mut path = tauri::api::path::app_data_dir(&tauri::Config::default()).unwrap();
    path.push("clothing_items.json");
    path
}

fn load_clothing_items() -> Vec<ClothingItem> {
    let path = get_data_file_path();
    if path.exists() {
        let data = fs::read_to_string(path).unwrap();
        serde_json::from_str(&data).unwrap()
    } else {
        Vec::new()
    }
}

fn save_clothing_items(items: &[ClothingItem]) {
    let path = get_data_file_path();
    let data = serde_json::to_string_pretty(items).unwrap();
    fs::write(path, data).unwrap();
}

#[tauri::command]
fn get_clothing_items(state: State<AppState>) -> Vec<ClothingItem> {
    state.clothing_items.lock().unwrap().clone()
}

#[tauri::command]
fn add_clothing_item(name: String, cost: f64, state: State<AppState>) {
    let mut items = state.clothing_items.lock().unwrap();
    items.push(ClothingItem { name, cost, uses: Vec::new() });
    save_clothing_items(&items);
}

#[tauri::command]
fn add_use(name: String, date: String, state: State<AppState>) {
    let mut items = state.clothing_items.lock().unwrap();
    if let Some(item) = items.iter_mut().find(|i| i.name == name) {
        if let Ok(parsed_date) = NaiveDate::parse_from_str(&date, "%Y-%m-%d") {
            item.uses.push(parsed_date);
            save_clothing_items(&items);
        }
    }
}

fn main() {
    let app_state = AppState {
        clothing_items: Mutex::new(load_clothing_items()),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![get_clothing_items, add_clothing_item, add_use])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}