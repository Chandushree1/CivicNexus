const Anthropic = require("@anthropic-ai/sdk");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const generateComplaintId = require("../utils/generateComplaintId");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Check https://docs.claude.com for the current model id if this ever 404s.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

const CATEGORIES = [
  "Roads & Potholes",
  "Garbage",
  "Streetlights",
  "Drainage",
  "Water Supply",
  "Public Facilities",
  "Parks",
  "Electricity",
  "Other",
];

const SYSTEM_PROMPT = `You are the CivicConnect Assistant, an in-app helper inside a citizen
grievance portal for local civic issues (potholes, garbage, streetlights, drainage, water
supply, public facilities, parks, electricity, etc).

You can do two things:

1. Answer questions — about how CivicConnect works, what happens after a complaint is
   filed, expected timelines (SLA: Urgent = 48 hours, High = 96 hours, Medium/Low = 168
   hours), which category fits a given issue, how officers get assigned, how ratings work,
   or general civic-issue guidance.

2. File a new complaint for the logged-in citizen using the file_complaint tool. Before
   calling it you must have: a category (exactly one of: ${CATEGORIES.join(", ")}), a
   short title, a description of the problem, and the location address. Priority is
   optional (defaults to Medium — suggest "Urgent" only for things like exposed wiring,
   open drains, or safety hazards). Always restate the details back in plain language and
   let the user confirm or correct them before you call the tool, unless they've already
   clearly confirmed everything in this conversation.

3. Check on existing complaints with check_complaint_status (needs a complaint ID like
   CC-2026-001245) or list_my_complaints (their recent complaints, optionally by status).

Rules:
- Never invent a complaint ID, status, or resolution — only report what a tool returns.
- If required filing details are missing, ask one short, direct follow-up question rather
  than guessing.
- If file_complaint returns an error about location, tell the user plainly what to do
  (e.g. share location access, or use the Report Issue page for the map picker) — don't
  make up coordinates yourself.
- Keep replies short, plain text, no markdown headers or heavy formatting.`;

const tools = [
  {
    name: "file_complaint",
    description: "File a new civic complaint on behalf of the logged-in citizen.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: CATEGORIES },
        title: {
          type: "string",
          description: "Short issue title, e.g. 'Broken streetlight on 5th Main'",
        },
        description: { type: "string", description: "Full description of the issue" },
        priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
        address: { type: "string", description: "Street address / landmark of the issue" },
        ward: { type: "string", description: "Ward name or number, if the user gave one" },
      },
      required: ["category", "title", "description", "address"],
    },
  },
  {
    name: "check_complaint_status",
    description:
      "Look up one complaint belonging to the logged-in citizen by its complaint ID (e.g. CC-2026-001245).",
    input_schema: {
      type: "object",
      properties: { complaintId: { type: "string" } },
      required: ["complaintId"],
    },
  },
  {
    name: "list_my_complaints",
    description: "List the logged-in citizen's recent complaints, optionally filtered by status.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"],
        },
      },
    },
  },
];

async function notify(userId, type, title, message, complaintId) {
  await Notification.create({ user: userId, type, title, message, complaint: complaintId });
}

async function runTool(name, input, req) {
  const user = req.user;

  if (name === "file_complaint") {
    if (user.role !== "citizen") {
      return { error: "Only citizen accounts can file complaints." };
    }

    const { category, title, description, priority, address, ward } = input;

    // Prefer coordinates the frontend sent for this turn (from browser geolocation),
    // fall back to the citizen's saved profile location.
    const lat = req.body.lat ?? user.location?.lat;
    const lng = req.body.lng ?? user.location?.lng;
    if (lat == null || lng == null) {
      return {
        error:
          "No map location available. Ask the user to allow location access in the chat, " +
          "or use the 'Report Issue' page once to set their location.",
      };
    }

    const complaintId = await generateComplaintId();
    const slaHours = priority === "Urgent" ? 48 : priority === "High" ? 96 : 168;

    const complaint = await Complaint.create({
      complaintId,
      citizen: user._id,
      category,
      title,
      description,
      priority: priority || "Medium",
      location: { address, lat, lng, ward },
      status: "Submitted",
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      timeline: [{ status: "Submitted", note: "Complaint registered via chatbot", actor: user._id }],
    });

    await notify(
      user._id,
      "complaint_submitted",
      "Complaint submitted",
      `${complaint.complaintId} — ${title} was registered successfully via the assistant.`,
      complaint._id
    );

    return {
      complaintId: complaint.complaintId,
      status: complaint.status,
      slaDeadline: complaint.slaDeadline,
    };
  }

  if (name === "check_complaint_status") {
    const complaint = await Complaint.findOne({
      complaintId: input.complaintId,
      citizen: user._id,
    });
    if (!complaint) return { error: "No complaint with that ID found on this account." };
    return {
      complaintId: complaint.complaintId,
      title: complaint.title,
      status: complaint.status,
      priority: complaint.priority,
      slaDeadline: complaint.slaDeadline,
      lastUpdate: complaint.timeline[complaint.timeline.length - 1],
    };
  }

  if (name === "list_my_complaints") {
    const filter = { citizen: user._id };
    if (input.status) filter.status = input.status;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).limit(10);
    return complaints.map((c) => ({
      complaintId: c.complaintId,
      title: c.title,
      category: c.category,
      status: c.status,
      createdAt: c.createdAt,
    }));
  }

  return { error: "Unknown tool" };
}

// @route POST /api/chatbot/message  (protected — any logged-in role can ask questions;
// only citizens can successfully file complaints, enforced in runTool above)
exports.sendMessage = async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res
        .status(500)
        .json({ message: "Chatbot is not configured (missing ANTHROPIC_API_KEY on the server)." });
    }

    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "message is required" });
    }

    // history is the array this endpoint returned last time — the frontend just
    // echoes it back so the backend stays stateless.
    const messages = Array.isArray(history) ? [...history] : [];
    messages.push({ role: "user", content: message });

    let finalText = "";

    // Allow a few tool-use round trips within a single user turn.
    for (let i = 0; i < 5; i++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      const toolUses = response.content.filter((b) => b.type === "tool_use");
      const textBlocks = response.content.filter((b) => b.type === "text");
      finalText = textBlocks.map((b) => b.text).join("\n") || finalText;

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        break;
      }

      const toolResults = [];
      for (const tu of toolUses) {
        const result = await runTool(tu.name, tu.input, req);
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    res.json({ reply: finalText, history: messages });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: err.message || "Chatbot request failed" });
  }
};
