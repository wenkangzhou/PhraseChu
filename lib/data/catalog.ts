import type { Scenario, Theme } from "@/types/domain";

export const themes: Theme[] = [
  { id: "daily-life", title: "Daily Life", icon: "☀️", description: "Small moments, naturally said" },
  { id: "commuting", title: "Commuting", icon: "🚇", description: "Subway, taxi, and getting around" },
  { id: "food", title: "Food", icon: "🍽️", description: "Order, ask, and enjoy" },
  { id: "travel", title: "Travel", icon: "✈️", description: "From check-in to exploring" },
  { id: "work", title: "Work", icon: "💻", description: "Clear, useful work English" },
  { id: "social", title: "Social", icon: "💬", description: "Plans, small talk, and opinions" },
  { id: "shopping", title: "Shopping", icon: "🛍️", description: "Find, compare, and pay" },
  { id: "family", title: "Family", icon: "🏡", description: "Everyday family moments" },
  { id: "health-exercise", title: "Health & Exercise", icon: "🏃", description: "Training and feeling better" },
  { id: "technology", title: "Technology", icon: "⌘", description: "Bugs, AI, and digital life" },
];

export const scenarios: Scenario[] = [
  { id: "personal", title: "My Phrases", themeId: "daily-life", description: "Expressions you asked PhraseChu to save." },
  { id: "running-late", title: "Running Late", themeId: "daily-life", description: "Let people know when plans slip." },
  { id: "making-plans", title: "Making Plans", themeId: "social", description: "Find a time that works." },
  { id: "taking-subway", title: "Taking the Subway", themeId: "commuting", description: "Navigate a busy metro." },
  { id: "taking-taxi", title: "Taking a Taxi", themeId: "commuting", description: "Get where you need to go." },
  { id: "ordering-food", title: "Ordering Food", themeId: "food", description: "Order comfortably and naturally." },
  { id: "ordering-steak", title: "Ordering Steak", themeId: "food", description: "Get the steak you want." },
  { id: "paying-bill", title: "Paying the Bill", themeId: "food", description: "Wrap up a meal smoothly." },
  { id: "hotel-checkin", title: "Hotel Check-in", themeId: "travel", description: "Check in and settle down." },
  { id: "airport-checkin", title: "Airport Check-in", themeId: "travel", description: "Move through the airport." },
  { id: "directions", title: "Asking for Directions", themeId: "travel", description: "Find your way with confidence." },
  { id: "small-talk", title: "Small Talk", themeId: "social", description: "Keep light conversation flowing." },
  { id: "weather", title: "Talking About Weather", themeId: "daily-life", description: "A reliable conversation opener." },
  { id: "suggestions", title: "Making Suggestions", themeId: "social", description: "Offer an idea without pressure." },
  { id: "agreeing", title: "Agreeing & Disagreeing", themeId: "social", description: "Share your view tactfully." },
  { id: "asking-help", title: "Asking for Help", themeId: "daily-life", description: "Ask clearly and politely." },
  { id: "work-progress", title: "Work Progress", themeId: "work", description: "Give concise status updates." },
  { id: "bugs", title: "Talking About Bugs", themeId: "technology", description: "Describe software problems." },
  { id: "running", title: "Talking About Running", themeId: "health-exercise", description: "Training, effort, and recovery." },
  { id: "travel-talk", title: "Talking About Travel", themeId: "travel", description: "Share trips and preferences." },
  { id: "kids", title: "Talking With Kids", themeId: "family", description: "Warm, simple family English." },
];

export const themeById = (id: string) => themes.find((theme) => theme.id === id);
export const scenarioById = (id: string) => scenarios.find((scenario) => scenario.id === id);
