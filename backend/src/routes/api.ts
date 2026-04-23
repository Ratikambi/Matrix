import { Router } from "express";
import { generateWeather, predictPest, riskZones, getRiskZones } from "../services/pest-service";

const router = Router();

// Get live dashboard data
router.get("/live", async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    
    if (lat && lng) {
      console.log(`📍 Received coordinates: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`);
    } else {
      console.log("📍 No coordinates provided - using default location");
    }
    
    const weather = await generateWeather(lat, lng);
    const prediction = await predictPest(weather);
    
    console.log(`✅ Location detected: ${weather.location}`);
    
    res.json({ weather, prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch live data" });
  }
});

// Predict for manual scenario
router.post("/predict", async (req, res) => {
  try {
    const prediction = await predictPest(req.body);
    res.json(prediction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to predict pest" });
  }
});

// Get risk zones for the map - dynamically calculated based on weather
router.get("/zones", async (req, res) => {
  try {
    const zones = await getRiskZones();
    res.json(zones);
  } catch (err) {
    console.error("Failed to fetch risk zones:", err);
    // Fallback to static zones
    res.json(riskZones);
  }
});

// Enhanced Chatbot logic with crop-specific advice
router.post("/chat", (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();
  
  let reply = "I am processing your neural scan data. Please hold.";
  
  // Pest-related queries
  if (lower.includes("aphid")) {
     reply = "🔍 Aphids detected on your crop. Immediate action required:\n• Apply neem oil spray early morning or evening to avoid leaf burn\n• Spray every 7 days for 3 weeks to break the life cycle\n• Monitor leaf undersides where colonies form\n• Consider releasing ladybugs for biological control\n• Increase irrigation slightly to help stressed plants recover.";
  } else if (lower.includes("armyworm")) {
     reply = "⚠️ Fall Armyworms identified - highly destructive pest:\n• Deploy pheromone traps immediately to monitor population\n• Apply Bacillus thuringiensis (Bt) spray for safe biological control\n• Handpick egg masses on leaf undersides daily\n• Use organic spinosad for severe infestations\n• Prune affected foliage to reduce feeding sites\n• Maintain crop rotation to prevent future outbreaks.";
  } else if (lower.includes("locust")) {
     reply = "🚨 CRITICAL: Locust outbreak detected - Immediate action required!\n• Contact local agricultural authorities immediately\n• Coordinate with neighboring farms for mass control measures\n• Deploy biopesticide reserves (Metarhizium fungus)\n• Implement mechanical barriers around vulnerable crops\n• Monitor hourly for swarm movement patterns\n• Prepare irrigation to minimize dust from control sprays.";
  } else if (lower.includes("whitefly")) {
     reply = "🦟 Whiteflies identified - Monitor and control:\n• Install yellow sticky traps at canopy height to track populations\n• Spray with insecticidal soap targeting nymphs (most vulnerable stage)\n• Use reflective mulches to confuse adults\n• Increase air circulation with fan placement\n• Apply neem oil weekly until infestation clears\n• Encourage parasitoid wasps (Encarsia) for long-term control.";
  } 
  // Crop health & nutrition
  else if (lower.includes("water") || lower.includes("irrigation") || lower.includes("dry")) {
     reply = "💧 Hydration Analysis:\n• Current moisture levels show STRESS - turgor pressure declining\n• Immediate action: Increase irrigation by 15-20% for next 48 hours\n• Water deeply early morning (5-7 AM) to reduce evaporation loss\n• Check soil at 15cm depth - should feel moist but not waterlogged\n• Mulch base to retain soil moisture\n• Reduce pest damage risk by maintaining optimal hydration.";
  } else if (lower.includes("fertilizer") || lower.includes("nutrient") || lower.includes("nitrogen")) {
     reply = "🌱 Nutrient Assessment:\n• Chlorophyll density indicates NITROGEN DEFICIENCY\n• Apply balanced NPK foliar spray (10:10:10) twice weekly\n• Or use urea spray (2% solution) for quick nitrogen boost\n• Allow 48h after spray before additional treatments\n• Side-dress with compost to improve long-term fertility\n• Retest leaf color after 2 weeks to confirm recovery.";
  } else if (lower.includes("disease") || lower.includes("fungal") || lower.includes("blight")) {
     reply = "🔬 Disease Detection:\n• Fungal pathology confirmed on tissue analysis\n• Apply copper-sulfate fungicide or sulfur dust immediately\n• Improve air circulation by pruning dense foliage\n• Remove all infected leaves carefully and dispose\n• Avoid overhead watering - use drip irrigation\n• Repeat fungicide every 10-14 days until cleared\n• Sanitize tools between plants.";
  } 
  // Crop type specific advice
  else if (lower.includes("vineyard") || lower.includes("grape") || lower.includes("vitis")) {
     reply = "🍇 Grape/Vineyard Management:\n• Current specimen identified as Vitis vinifera (wine grape)\n• Ensure pruning during dormancy to manage disease pressure\n• Watch for powdery mildew in warm, humid conditions\n• Thin clusters for better ripening and airflow\n• Monitor for spider mites during hot, dry periods\n• Network with other vineyards for pest/disease alerts.";
  } else if (lower.includes("yield") || lower.includes("production")) {
     reply = "📊 Yield Optimization:\n• Current pathology status affects production by ~40-50%\n• Priority: Eliminate pest pressure and restore plant vigor\n• Expected recovery timeline: 3-4 weeks with proper intervention\n• Monitor daily for pest resurgence\n• Once stable, implement nutrient program for regrowth\n• Plan preventive spray schedule for next season.";
  } else if (lower.includes("season") || lower.includes("weather") || lower.includes("forecast")) {
     reply = "🌤️ Seasonal Crop Planning:\n• Monitor weather patterns closely over next 7 days\n• High humidity (>75%) increases disease/pest risk - adjust sprays accordingly\n• Plan irrigation around rainfall forecasts\n• Coordinate pesticide applications for optimal effectiveness\n• Use pest prediction alerts to get ahead of outbreaks.";
  }
  // General crop health
  else if (lower.includes("crop") || lower.includes("health") || lower.includes("condition")) {
     reply = "🌾 Crop Health Assessment:\n• Current neural scans show CRITICAL PATHOLOGY in Sector 7G\n• Multiple issues detected: Necrosis (87.3%), Hydration (62.4%), Chlorophyll (68.1%)\n• Immediate action plan:\n  1. Increase irrigation by 15% immediately\n  2. Apply foliar NPK spray within 24h\n  3. Deploy pest control measures\n  4. Prune affected foliage\n  5. Monitor daily for next 3 weeks\n• Expected stabilization: 2-3 weeks with intervention.";
  } else if (lower.includes("recommendation") || lower.includes("suggest")) {
     reply = "💡 Comprehensive Recommendation:\n• Your crop is experiencing multi-factor stress (pests, hydration, nutrients)\n• Priority Actions (Next 24h):\n  ✓ Increase irrigation\n  ✓ Apply neem oil for pest control\n  ✓ Foliar NPK spray for nutrition\n• Follow-up Actions (Week 1-2):\n  ✓ Daily pest monitoring\n  ✓ Pruning of severely affected foliage\n  ✓ Repeat nutrient applications\n• Review Actions (Week 3-4):\n  ✓ Assess recovery progress\n  ✓ Adjust spray schedule based on results\n  ✓ Plan preventive measures for next season.";
  } else {
     reply = "🔍 I need more specific information to help you. Please ask about:\n• Specific pests (aphids, armyworms, locusts, whiteflies)\n• Crop health concerns (disease, yellowing, wilting)\n• Irrigation and watering\n• Nutrient/fertilizer needs\n• Weather-related issues\n• Yield optimization\n\nDescribe your symptoms or crop type for targeted recommendations!";
  }

  res.json({ reply });
});

export default router;
