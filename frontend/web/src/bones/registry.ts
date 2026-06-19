import { registerBones } from "boneyard-js/react";
import type { SkeletonResult, ResponsiveBones } from "boneyard-js";

const appSidebarBones: SkeletonResult = {
  name: "app-sidebar",
  viewportWidth: 0,
  width: 260,
  height: 800,
  bones: [
    [6, 20, 45, 24, 6], // Logo
    [85, 20, 10, 24, 4], // Collapse button
    [6, 60, 88, 36, 8], // Search bar
    [6, 110, 88, 40, 8], // New Chat button
    [6, 165, 88, 520, 8, true], // Conversation list container background
    // Repeating conversation list items
    [12, 185, 12, 28, "50%"], [28, 194, 50, 10, 4],
    [12, 235, 12, 28, "50%"], [28, 244, 40, 10, 4],
    [12, 285, 12, 28, "50%"], [28, 294, 60, 10, 4],
    [12, 335, 12, 28, "50%"], [28, 344, 45, 10, 4],
    [12, 385, 12, 28, "50%"], [28, 394, 55, 10, 4],
    // Bottom action buttons
    [6, 700, 88, 36, 6], // Settings
    [6, 745, 88, 36, 6]  // Logout
  ]
};

const conversationListBones: SkeletonResult = {
  name: "conversation-list",
  viewportWidth: 0,
  width: 240,
  height: 500,
  bones: [
    [6, 15, 12, 28, "50%"], [24, 24, 60, 10, 4],
    [6, 55, 12, 28, "50%"], [24, 64, 50, 10, 4],
    [6, 95, 12, 28, "50%"], [24, 104, 65, 10, 4],
    [6, 135, 12, 28, "50%"], [24, 144, 40, 10, 4],
    [6, 175, 12, 28, "50%"], [24, 184, 55, 10, 4]
  ]
};

const modelDropdownBones: SkeletonResult = {
  name: "model-dropdown",
  viewportWidth: 0,
  width: 150,
  height: 28,
  bones: [
    [0, 2, 100, 24, 6]
  ]
};

const chatWindowBones: SkeletonResult = {
  name: "chat-window",
  viewportWidth: 0,
  width: 800,
  height: 800,
  bones: [
    [0, 0, 100, 56, 0, true], // Header container
    [3, 16, 25, 24, 6], // Header title
    [80, 16, 15, 24, 6], // Header buttons
    [0, 56, 100, 644, 0, true], // Messages background
    // Chat bubbles
    [3, 90, 8, 32, "50%"], [13, 90, 45, 50, 12], // Msg 1
    [50, 160, 47, 40, 12], // Msg 2
    [3, 220, 8, 32, "50%"], [13, 220, 60, 120, 12], // Msg 3
    [40, 360, 57, 50, 12], // Msg 4
    // Bottom input
    [3, 715, 94, 60, 12, true],
    [6, 735, 30, 20, 6],
    [88, 727, 8, 36, 8]
  ]
};

const messageBubbleBones: SkeletonResult = {
  name: "message-bubble",
  viewportWidth: 0,
  width: 600,
  height: 80,
  bones: [
    [0, 10, 5, 32, "50%"], // Avatar
    [8, 16, 50, 12, 4], // Line 1
    [8, 38, 70, 12, 4], // Line 2
    [8, 60, 30, 12, 4]  // Line 3
  ]
};

const apiKeyListBones: SkeletonResult = {
  name: "api-key-list",
  viewportWidth: 0,
  width: 600,
  height: 300,
  bones: [
    [0, 10, 100, 60, 8, true], [3, 22, 20, 16, 4], [30, 22, 50, 16, 4], [90, 22, 7, 36, 6],
    [0, 80, 100, 60, 8, true], [3, 92, 20, 16, 4], [30, 92, 50, 16, 4], [90, 92, 7, 36, 6],
    [0, 150, 100, 60, 8, true], [3, 162, 20, 16, 4], [30, 162, 50, 16, 4], [90, 162, 7, 36, 6]
  ]
};

const apiKeysSettingsBones: SkeletonResult = {
  name: "api-keys",
  viewportWidth: 0,
  width: 600,
  height: 300,
  bones: [
    [0, 10, 30, 24, 6],
    [0, 50, 15, 14, 4],
    [0, 75, 100, 40, 8],
    [0, 135, 15, 14, 4],
    [0, 160, 100, 40, 8],
    [0, 225, 20, 40, 8]
  ]
};

const historySettingsBones: SkeletonResult = {
  name: "history-settings",
  viewportWidth: 0,
  width: 600,
  height: 300,
  bones: [
    [0, 10, 30, 24, 6],
    [0, 50, 15, 14, 4],
    [0, 75, 100, 40, 8],
    [0, 135, 15, 14, 4],
    [0, 160, 100, 40, 8],
    [0, 225, 20, 40, 8]
  ]
};

const profileSettingsBones: SkeletonResult = {
  name: "profile-settings",
  viewportWidth: 0,
  width: 600,
  height: 300,
  bones: [
    [0, 10, 30, 24, 6],
    [0, 50, 15, 14, 4],
    [0, 75, 100, 40, 8],
    [0, 135, 15, 14, 4],
    [0, 160, 100, 40, 8],
    [0, 225, 20, 40, 8]
  ]
};

export const bonesRegistry: Record<string, SkeletonResult> = {
  "app-sidebar": appSidebarBones,
  "conversation-list": conversationListBones,
  "model-dropdown": modelDropdownBones,
  "chat-window": chatWindowBones,
  "message-bubble": messageBubbleBones,
  "api-key-list": apiKeyListBones,
  "api-keys": apiKeysSettingsBones,
  "history-settings": historySettingsBones,
  "profile-settings": profileSettingsBones
};

// Register all bones globally
registerBones(bonesRegistry);