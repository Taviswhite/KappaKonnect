#!/usr/bin/env node
/**
 * Upload avatar images to Supabase storage bucket 'avatars'
 * 
 * Usage:
 *   node scripts/upload-avatars.js <folder_path>
 * 
 * Example:
 *   node scripts/upload-avatars.js ./avatars/2025-2024
 * 
 * Requirements:
 *   - VITE_SUPABASE_URL or SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (for admin access)
 *   - Images should be named using one of these formats:
 *     - email@example.com.jpg (or .jpeg, .png)
 *     - firstname_lastname.jpg
 *     - Full name with underscores
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "fs/promises";
import { join, extname, basename } from "path";
import { createReadStream } from "fs";
import { config } from "dotenv";

// Load .env file if it exists
config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "avatars";

function requireEnv(name, fallbackName = null) {
  let v = process.env[name];
  if ((!v || String(v).trim() === "") && fallbackName) {
    v = process.env[fallbackName];
  }
  if (!v || String(v).trim() === "") {
    console.error(`Missing required env: ${name}${fallbackName ? ` or ${fallbackName}` : ""}`);
    process.exit(1);
  }
  return v;
}

async function uploadFile(supabase, filePath, fileName) {
  try {
    const fileData = await readFile(filePath);
    const fileExt = extname(fileName).toLowerCase();
    
    // Validate image file extension
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    if (!validExtensions.includes(fileExt)) {
      console.warn(`⚠️  Skipping ${fileName}: not a valid image file`);
      return false;
    }

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileData, {
        contentType: `image/${fileExt.slice(1)}`,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
      return false;
    }

    console.log(`✅ Uploaded: ${fileName}`);
    return true;
  } catch (err) {
    console.error(`❌ Error uploading ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const folderPath = process.argv[2];
  if (!folderPath) {
    console.error("Usage: node scripts/upload-avatars.js <folder_path>");
    console.error("Example: node scripts/upload-avatars.js ./avatars/2025-2024");
    process.exit(1);
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  // Check if bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Error checking buckets:", bucketsError.message);
    process.exit(1);
  }

  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.error(`❌ Bucket '${BUCKET_NAME}' does not exist. Please create it in Supabase dashboard first.`);
    process.exit(1);
  }

  console.log(`📁 Reading files from: ${folderPath}`);
  console.log(`📦 Uploading to bucket: ${BUCKET_NAME}\n`);

  try {
    const files = await readdir(folderPath);
    const imageFiles = files.filter((file) => {
      const ext = extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.error(`❌ No image files found in ${folderPath}`);
      process.exit(1);
    }

    console.log(`Found ${imageFiles.length} image file(s)\n`);

    let successCount = 0;
    let failCount = 0;

    for (const fileName of imageFiles) {
      const filePath = join(folderPath, fileName);
      const success = await uploadFile(supabase, filePath, fileName);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`\n💡 Next step: Run the map_all_avatars.sql migration to link these images to profiles.`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`❌ Folder not found: ${folderPath}`);
    } else {
      console.error(`❌ Error reading folder:`, err.message);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
