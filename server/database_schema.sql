-- Appearance theme configuration
CREATE TABLE IF NOT EXISTS `appearance_theme` (
    `id` INT NOT NULL DEFAULT 1,
    `primary_color` VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    `inactive_color` VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appearance shape configuration
CREATE TABLE IF NOT EXISTS `appearance_shape` (
    `id` INT NOT NULL DEFAULT 1,
    `shape_type` VARCHAR(20) NOT NULL DEFAULT 'hexagon',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Global appearance settings
CREATE TABLE IF NOT EXISTS `appearance_settings` (
    `id` INT NOT NULL DEFAULT 1,
    `locked_models` TEXT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appearance restrictions (job/gang blacklisted models and clothing)
CREATE TABLE IF NOT EXISTS `appearance_restrictions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(50) NULL DEFAULT NULL,
    `gang` VARCHAR(50) NULL DEFAULT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `type` ENUM('model', 'clothing') NOT NULL,
    `part` ENUM('model','drawable','prop') NOT NULL DEFAULT 'drawable',
    `category` VARCHAR(32) NULL DEFAULT NULL,
    `item_id` INT NOT NULL,
    `textures_all` TINYINT(1) NOT NULL DEFAULT 1,
    `textures` TEXT NULL,
    `name` VARCHAR(100) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `job_gender` (`job`, `gender`),
    INDEX `gang_gender` (`gang`, `gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Advanced JSON blacklist sets (per job/gang and gender)
-- Stores a TBlacklist JSON structure, e.g.
-- { "models": ["mp_m_freemode_01"], "drawables": { "masks": { "textures": { "1": [2,5,10] } } }, "props": {} }
CREATE TABLE IF NOT EXISTS `appearance_blacklists` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(50) NULL DEFAULT NULL,
    `gang` VARCHAR(50) NULL DEFAULT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `data` LONGTEXT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_job_gang_gender` (`gender`, `job`, `gang`),
    INDEX `idx_job_gender` (`job`, `gender`),
    INDEX `idx_gang_gender` (`gang`, `gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migration helper (run if upgrading existing DB without dropping tables)
-- Adds new columns to appearance_restrictions for part/category/textures
-- NOTE: Safe to run; redundant adds will error, so run manually as needed.
-- ALTER TABLE `appearance_restrictions` ADD COLUMN `part` ENUM('model','drawable','prop') NOT NULL DEFAULT 'drawable';
-- ALTER TABLE `appearance_restrictions` ADD COLUMN `category` VARCHAR(32) NULL DEFAULT NULL;
-- ALTER TABLE `appearance_restrictions` ADD COLUMN `textures_all` TINYINT(1) NOT NULL DEFAULT 1;
-- ALTER TABLE `appearance_restrictions` ADD COLUMN `textures` TEXT NULL;

-- Shop settings (global toggles for ped usage in shops)
CREATE TABLE IF NOT EXISTS `appearance_shop_settings` (
    `id` INT NOT NULL DEFAULT 1,
    `enable_peds_for_shops` TINYINT(1) NOT NULL DEFAULT 1,
    `enable_peds_for_clothing_rooms` TINYINT(1) NOT NULL DEFAULT 1,
    `enable_peds_for_player_outfit_rooms` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shop configurations (clothing, barber, tattoo, surgeon)
CREATE TABLE IF NOT EXISTS `appearance_shop_configs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `type` ENUM('clothing', 'barber', 'tattoo', 'surgeon') NOT NULL,
    `blip_show` TINYINT(1) NOT NULL DEFAULT 1,
    `blip_sprite` INT NOT NULL DEFAULT 366,
    `blip_color` INT NOT NULL DEFAULT 47,
    `blip_scale` DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    `blip_name` VARCHAR(100) NOT NULL DEFAULT 'Shop',
    `cost` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Zones for appearance shops (with polyzone support)
CREATE TABLE IF NOT EXISTS `appearance_zones` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `type` ENUM('clothing', 'barber', 'tattoo', 'surgeon') NOT NULL,
    `coords` TEXT NOT NULL COMMENT 'JSON: {x, y, z, heading}',
    `polyzone` TEXT NULL COMMENT 'JSON: array of {x, y} points',
    `show_blip` TINYINT(1) NOT NULL DEFAULT 1,
    `job` VARCHAR(50) NULL DEFAULT NULL,
    `gang` VARCHAR(50) NULL DEFAULT NULL,
    `name` VARCHAR(100) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_job` (`job`),
    INDEX `idx_gang` (`gang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Job and gang persistent outfits
CREATE TABLE IF NOT EXISTS `appearance_job_outfits` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(50) NULL DEFAULT NULL,
    `gang` VARCHAR(50) NULL DEFAULT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `outfit_name` VARCHAR(100) NOT NULL,
    `outfit_data` LONGTEXT NOT NULL COMMENT 'JSON: appearance data',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_job_gender` (`job`, `gender`),
    INDEX `idx_gang_gender` (`gang`, `gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
