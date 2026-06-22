import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, X, Plus, AlertTriangle, Clock,
  BookOpen, ClipboardList, Trash2, Loader2, Copy,
  Download, Upload, Pencil, ImagePlus, Check, Package
} from "lucide-react";

const BRANDS = ["Legge", "Brio", "Schlage", "Lemaar", "Gainsborough"];

const BRAND_STYLE = {
  Legge:        "bg-indigo-50 text-indigo-700 border-indigo-200",
  Brio:         "bg-rose-50 text-rose-700 border-rose-200",
  Schlage:      "bg-sky-50 text-sky-700 border-sky-200",
  Lemaar:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  Gainsborough: "bg-amber-50 text-amber-700 border-amber-200",
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "levers", label: "Levers & Knobs" },
  { id: "deadbolts", label: "Deadbolts" },
  { id: "mortice", label: "Mortice Locks" },
  { id: "smart", label: "Electronic Locks" },
  { id: "patio", label: "Patio & Sliding" },
  { id: "entrance", label: "Entrance Hardware" },
  { id: "bolts", label: "Flush & Security Bolts" },
  { id: "spares", label: "Spare Parts" },
  { id: "sliding", label: "Sliding & Folding" },
  { id: "policy", label: "Policy & Warranty" },
];

const CATEGORY_STYLE = {
  levers:    { dot: "bg-amber-600",   text: "text-amber-700" },
  deadbolts: { dot: "bg-rose-600",    text: "text-rose-700" },
  mortice:   { dot: "bg-indigo-600",  text: "text-indigo-700" },
  smart:     { dot: "bg-sky-600",     text: "text-sky-700" },
  patio:     { dot: "bg-teal-600",    text: "text-teal-700" },
  entrance:  { dot: "bg-orange-600",  text: "text-orange-700" },
  bolts:     { dot: "bg-violet-600",  text: "text-violet-700" },
  spares:    { dot: "bg-emerald-600", text: "text-emerald-700" },
  sliding:   { dot: "bg-cyan-600",    text: "text-cyan-700" },
  policy:    { dot: "bg-stone-500",   text: "text-stone-700" },
};

const SEED_ENTRIES = [
  {
    id: "e1", category: "smart", title: "Trilock Freestyle won't pair via Bluetooth",
    model: "Freestyle FX-Series", tags: ["bluetooth", "pairing", "app", "trilock", "freestyle"],
    escalate: false, summary: "App can't discover the lock, or pairing times out repeatedly.",
    steps: [
      "Confirm phone Bluetooth is on and within 2m of the lock.",
      "Check the lock has fresh batteries — low batteries can disrupt pairing.",
      "Close and reopen the companion app, then retry 'Add device'.",
      "If still failing, factory reset the lock (hold program button 10s) and pair again.",
      "Note app version and phone OS if escalating.",
    ], images: [], productIds: ["p1"],
  },
  {
    id: "e2", category: "smart", title: "Keypad unresponsive or flashing red",
    model: "Trilock TL-Series", tags: ["keypad", "battery", "trilock", "red light"],
    escalate: false, summary: "Keypad shows no lights, or flashes red on every code entry.",
    steps: [
      "Ask if the low-battery chime has sounded recently.",
      "Replace batteries with fresh alkaline cells, all four at once.",
      "Wipe keypad contacts with a dry cloth — moisture can cause false reads.",
      "Re-enter the master code to confirm the keypad is reading correctly.",
      "If red light persists after fresh batteries, this is a keypad fault — arrange replacement.",
    ], images: [], productIds: ["p1", "p2", "p3", "p4"],
  },
  {
    id: "e3", category: "deadbolts", title: "Deadbolt key is stiff or hard to turn",
    model: "All deadbolt models", tags: ["key", "stiff", "lubricant", "deadbolt"],
    escalate: false, summary: "Customer reports the key is difficult to turn or feels gritty.",
    steps: [
      "Ask how long they've had the lock and whether it's exposed to weather.",
      "Recommend a graphite or silicone-based lubricant — never oil, which attracts dirt.",
      "Check the door hasn't dropped on its hinges, causing bolt misalignment.",
      "If stiffness started suddenly, ask about a recently cut or duplicated key.",
    ], images: [], productIds: ["p6"],
  },
  {
    id: "e4", category: "mortice", title: "Mortice lock not latching, door doesn't sit flush",
    model: "", tags: ["latch", "alignment", "mortice", "strike plate"],
    escalate: false, summary: "Door doesn't close fully or the latch doesn't catch the strike plate.",
    steps: [
      "Check whether the issue is seasonal — timber doors swell in humidity.",
      "Ask the customer to check strike plate alignment with the latch bolt.",
      "Suggest loosening hinge screws slightly and re-squaring the door if it's dropped.",
      "If the latch itself doesn't retract smoothly, the lock body may need replacing.",
    ], images: [], productIds: ["p7"],
  },
  {
    id: "e5", category: "levers", title: "Lever handle feels loose or wobbles",
    model: "", tags: ["loose", "lever", "grub screw"],
    escalate: false, summary: "Handle has play in it or has started to droop.",
    steps: [
      "Most levers are held by a grub screw underneath the handle — ask the customer to check.",
      "Tightening the grub screw with a small Allen key usually resolves play.",
      "If there's no visible grub screw, the lever uses a sprung rose — check the rose hasn't loosened.",
      "Persistent looseness after tightening suggests a worn spindle — offer a spare part.",
    ], images: [], productIds: ["p5"],
  },
  {
    id: "e6", category: "patio", title: "Sliding patio door won't lock",
    model: "", tags: ["patio", "sliding", "alignment"],
    escalate: false, summary: "Latch won't engage when the sliding door is closed.",
    steps: [
      "Confirm the door is fully closed and not catching on the track.",
      "Check the strike/keeper on the frame lines up with the latch.",
      "Sliding doors often drop slightly over time — ask if the door has become harder to slide too.",
      "Recommend the customer check or adjust the door's roller height if accessible.",
    ], images: [], productIds: ["p8"],
  },
  {
    id: "e7", category: "smart", title: "Smart lock app shows offline / WiFi or Matter drops out",
    model: "", tags: ["wifi", "matter", "connectivity", "app"],
    escalate: true, summary: "Lock repeatedly disconnects from the home network or smart hub.",
    steps: [
      "Confirm the customer's WiFi/Matter hub is within range of the lock.",
      "Have them restart the hub/router and the lock.",
      "Check for app updates and confirm firmware is current.",
      "If drops continue after a network restart, escalate to Smart Lock technical support with details.",
    ], images: [], productIds: ["p3"],
  },
  {
    id: "e8", category: "policy", title: "Warranty claim — what's covered?",
    model: "", tags: ["warranty", "claim", "policy"],
    escalate: false, summary: "Customer wants to know if a fault is covered and how to claim.",
    steps: [
      "Ask for proof of purchase and approximate install date.",
      "Confirm the fault isn't due to incorrect installation or external damage.",
      "Check the current warranty term for the specific product line.",
      "Log the claim with product details, fault description, and photos if available.",
    ], images: [],
  },
  {
    id: "e9", category: "policy", title: "Return or exchange for incorrectly ordered hardware",
    model: "", tags: ["returns", "exchange", "retailer"],
    escalate: false, summary: "Customer ordered the wrong finish, size, or model.",
    steps: [
      "Confirm whether the item was purchased through a retailer or trade supplier — returns go through point of sale.",
      "Check the item is unused and in original packaging.",
      "Direct the customer to their retailer for exchange; we can confirm the correct model/finish for reorder.",
    ], images: [],
  },
  {
    id: "e10", category: "entrance", title: "Entrance set backset doesn't match the customer's door",
    model: "", tags: ["backset", "sizing", "door prep"],
    escalate: false, summary: "Customer unsure if hardware will fit their existing door prep.",
    steps: [
      "Ask for the backset measurement — distance from the door edge to the centre of the spindle hole.",
      "Standard backsets are typically 60mm or 70mm — confirm which the customer's door uses.",
      "If retrofitting, check the existing hole pattern matches the new set before they purchase.",
    ], images: [], productIds: ["p9"],
  },
  {
    id: "e11", category: "bolts", title: "Flush bolt sticking at the top of a double door",
    model: "", tags: ["flush bolt", "sticking", "double door"],
    escalate: false, summary: "Top flush bolt is hard to engage or doesn't stay retracted.",
    steps: [
      "Ask the customer to check for paint build-up around the bolt mechanism.",
      "Recommend a light application of dry lubricant on the bolt shaft.",
      "Confirm the strike hole in the door head is still aligned — doors shift seasonally.",
    ], images: [], productIds: ["p11"],
  },
  {
    id: "e12", category: "spares", title: "Customer needs spare parts but doesn't know the model",
    model: "", tags: ["spare parts", "model number", "identification"],
    escalate: false, summary: "Customer wants a replacement part but can't find a model number.",
    steps: [
      "Ask the customer to check the edge of the latch/bolt faceplate — model numbers are often stamped there.",
      "If unreadable, ask for a photo of the full handle/lock and the door thickness.",
      "Cross-reference visual style (lever shape, rose style) against current and past collections to identify a match.",
    ], images: [], productIds: ["p12"],
  },
  {
    id: "e13", category: "smart", title: "Smart lock battery drains quickly",
    model: "", tags: ["battery", "drain", "smart lock"],
    escalate: false, summary: "Customer is replacing batteries far more often than expected.",
    steps: [
      "Ask how often the lock is used per day — high-traffic doors naturally drain faster.",
      "Confirm they're using fresh alkaline (not rechargeable) batteries, which can read incorrectly.",
      "Check if 'always-on' Bluetooth or auto-lock features are enabled, which increase battery use.",
      "If drain is sudden and severe, this may indicate a motor fault — escalate if steps don't help.",
    ], images: [], productIds: ["p1", "p2", "p3", "p4"],
  },
  {
    id: "e14", category: "mortice", title: "Key snapped in mortice lock cylinder",
    model: "", tags: ["key broken", "snapped key", "cylinder"],
    escalate: true, summary: "Part of the key has broken off inside the lock cylinder.",
    steps: [
      "Advise the customer not to dig out the key fragment with metal tools — this can damage the cylinder.",
      "Confirm whether the door is currently locked or unlocked.",
      "This requires a locksmith or cylinder replacement — escalate to Technical Support / an approved locksmith partner.",
    ], images: [], productIds: ["p7"],
  },
];

const SEED_PRODUCTS = [
  {
    id: "p1", category: "smart", brand: "Legge", name: "Trilock Freestyle", model: "FX-200",
    description: "Bluetooth smart lock with keypad and app control — retrofits onto most standard entry doors without rewiring.",
    finishes: ["Matte Black", "Satin Nickel"],
    specs: { Connectivity: "Bluetooth", Power: "4x AA batteries", Backset: "60mm / 70mm adjustable", "Door thickness": "35–55mm" },
    tags: ["smart lock", "bluetooth", "keypad", "freestyle"], images: [], relatedIds: ["p12"],
  },
  {
    id: "p2", category: "smart", brand: "Legge", name: "Trilock Mode", model: "MD-100",
    description: "Compact smart lock with fingerprint and PIN access, designed to work without a companion app.",
    finishes: ["Matte Black", "Satin Chrome"],
    specs: { Connectivity: "Standalone (no app required)", Power: "4x AA batteries", Backset: "60mm", "Door thickness": "35–50mm" },
    tags: ["smart lock", "fingerprint", "pin", "mode"], images: [], relatedIds: ["p12"],
  },
  {
    id: "p3", category: "smart", brand: "Legge", name: "Trilock Liberty", model: "LB-300",
    description: "Wi-Fi connected smart lock with remote access and an activity log via the companion app.",
    finishes: ["Matte Black", "Satin Nickel", "Antique Brass"],
    specs: { Connectivity: "Wi-Fi + Bluetooth", Power: "4x AA batteries", Backset: "60mm / 70mm adjustable", "Door thickness": "35–55mm" },
    tags: ["smart lock", "wifi", "remote access", "liberty"], images: [], relatedIds: ["p12"],
  },
  {
    id: "p4", category: "smart", brand: "Legge", name: "Trilock Haven", model: "HV-150",
    description: "Entry-level keypad-only smart lock, designed for rentals and multi-unit properties.",
    finishes: ["Matte Black", "Satin Chrome"],
    specs: { Connectivity: "Keypad only", Power: "4x AA batteries", Backset: "60mm", "Door thickness": "35–50mm" },
    tags: ["smart lock", "keypad", "rental", "haven"], images: [], relatedIds: ["p12"],
  },
  {
    id: "p5", category: "levers", brand: "Schlage", name: "Lever Set — Round Rose", model: "LR-RR-01",
    description: "Standard mechanical passage or privacy lever set with a round rose.",
    finishes: ["Satin Chrome", "Antique Brass", "Matte Black"],
    specs: { Function: "Passage / Privacy", Backset: "60mm", "Door thickness": "35–45mm" },
    tags: ["lever", "round rose", "mechanical"], images: [], relatedIds: ["p12", "p6"],
  },
  {
    id: "p6", category: "deadbolts", brand: "Schlage", name: "Deadbolt — Single Cylinder", model: "DB-SC-02",
    description: "Key-operated external deadbolt — key outside, thumb-turn inside.",
    finishes: ["Satin Chrome", "Matte Black", "Antique Brass"],
    specs: { Function: "Single cylinder", Backset: "60mm / 70mm", "Door thickness": "35–50mm" },
    tags: ["deadbolt", "external", "single cylinder"], images: [],
  },
  {
    id: "p7", category: "mortice", brand: "Schlage", name: "Mortice Lock — Privacy Set", model: "ML-PR-03",
    description: "3-lever mortice lock for internal doors requiring a privacy function.",
    finishes: ["Satin Chrome", "Antique Brass"],
    specs: { Function: "Privacy (3-lever)", Backset: "57mm", "Door thickness": "40–50mm" },
    tags: ["mortice", "privacy", "internal"], images: [],
  },
  {
    id: "p8", category: "patio", brand: "Schlage", name: "Patio Bolt Set", model: "PB-SL-04",
    description: "Hook bolt lock set for aluminium and timber sliding doors.",
    finishes: ["Satin Chrome", "White", "Matte Black"],
    specs: { Function: "Hook bolt", "Door type": "Aluminium / timber sliding" },
    tags: ["patio", "sliding door", "hook bolt"], images: [],
  },
  {
    id: "p9", category: "entrance", brand: "Lemaar", name: "Entrance Set — Knob & Deadbolt Combo", model: "ES-KD-05",
    description: "Matching knob and deadbolt combination set for front entry doors.",
    finishes: ["Satin Chrome", "Antique Brass", "Matte Black"],
    specs: { Function: "Entry (knob + deadbolt)", Backset: "60mm", "Door thickness": "35–50mm" },
    tags: ["entrance", "knob", "deadbolt", "combo"], images: [], relatedIds: ["p12"],
  },
  {
    id: "p12", category: "spares", brand: "Brio", name: "Latch & Strike Plate — Standard", model: "LS-STD-60",
    description: "Standard spring latch and matching strike plate. Compatible with most 60mm-backset mechanical and smart lock bodies.",
    finishes: ["Satin Chrome", "Matte Black"],
    specs: { Backset: "60mm", "Door thickness": "35–50mm" },
    tags: ["latch", "strike plate", "spare part"], images: [],
  },
  {
    id: "p10", category: "spares", brand: "Lemaar", name: "Pull Handle — Stainless 300mm", model: "PH-SS-300",
    description: "Back-to-back pull handle for entry and shopfront doors.",
    finishes: ["Brushed Stainless", "Matte Black"],
    specs: { Length: "300mm", Fixing: "Back-to-back, through-bolt" },
    tags: ["pull handle", "stainless", "shopfront"], images: [],
  },
  {
    id: "p11", category: "bolts", brand: "Lemaar", name: "Flush Bolt Set", model: "FB-12",
    description: "Top and bottom flush bolts for the inactive leaf of a double door.",
    finishes: ["Satin Chrome", "Matte Black"],
    specs: { Length: "150mm / 200mm options", "Door type": "Timber double doors" },
    tags: ["flush bolt", "double door", "inactive leaf"], images: [],
  },
];

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : id;
}

function formatTime(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

function compressImage(file, maxWidth = 640, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image compression failed"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function ImagePicker({ images, setImages }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (f) => {
          const blob = await compressImage(f);
          // If a cloud uploader is wired up (e.g. Supabase, in the deployed build),
          // use it and store the resulting URL. Otherwise fall back to embedding
          // the image directly as base64 (the default Claude.ai artifact behaviour).
          if (typeof window.uploadImage === "function") {
            return await window.uploadImage(blob);
          }
          return await blobToDataURL(blob);
        })
      );
      setImages((prev) => [...prev, ...results]);
    } catch (e) {
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    const removed = images[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (typeof window.deleteImage === "function" && typeof removed === "string" && removed.startsWith("http")) {
      window.deleteImage(removed).catch(() => {});
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {images.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt="" className="w-16 h-16 object-cover rounded-md border border-stone-300" />
            <button
              onClick={() => removeImage(i)}
              className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-md border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:border-amber-700 hover:text-amber-700 transition"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-[11px] text-stone-400 mt-1">Photos are resized automatically to keep storage small.</div>
    </div>
  );
}

// Normalise a steps array — handles both old plain-string format and new {text,image} format
function normaliseSteps(steps) {
  return (steps || []).map((s) =>
    typeof s === "string" ? { text: s, image: null } : { text: s.text || "", image: s.image || null }
  );
}

function EntryFormModal({ initial, allProducts, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "levers");
  const [model, setModel] = useState(initial?.model || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [steps, setSteps] = useState(() => {
    const s = normaliseSteps(initial?.steps);
    return s.length > 0 ? s : [{ text: "", image: null }];
  });
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(", "));
  const [escalate, setEscalate] = useState(initial?.escalate || false);
  const [images, setImages] = useState(initial?.images || []);
  const [productIds, setProductIds] = useState(initial?.productIds || []);
  const [productSearch, setProductSearch] = useState("");
  const [uploadingStep, setUploadingStep] = useState(null);
  const stepFileRefs = useRef([]);

  const productCandidates = (allProducts || [])
    .filter((p) => !productIds.includes(p.id))
    .filter((p) => !productSearch.trim() || p.name.toLowerCase().includes(productSearch.trim().toLowerCase()))
    .slice(0, 6);

  const updateStep = (idx, field, value) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, { text: "", image: null }]);

  const removeStep = (idx) => setSteps((prev) => prev.filter((_, i) => i !== idx));

  const handleStepImage = async (idx, fileList) => {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    setUploadingStep(idx);
    try {
      const blob = await compressImage(file);
      let result;
      if (typeof window.uploadImage === "function") {
        result = await window.uploadImage(blob);
      } else {
        result = await blobToDataURL(blob);
      }
      updateStep(idx, "image", result);
    } catch (e) {
    } finally {
      setUploadingStep(null);
    }
  };

  const submit = () => {
    const validSteps = steps.filter((s) => s.text.trim());
    if (!title.trim() || validSteps.length === 0) return;
    onSave({
      title: title.trim(),
      category,
      model: model.trim(),
      summary: summary.trim(),
      steps: validSteps.map((s) => ({ text: s.text.trim(), image: s.image || null })),
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      escalate,
      images,
      productIds,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="border-b-4 border-amber-700 bg-stone-900 text-white px-5 py-3 flex items-center justify-between">
          <span className="font-display font-semibold">{initial ? "Edit reference entry" : "New reference entry"}</span>
          <button onClick={onClose} className="text-stone-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder="e.g. Lever spindle won't engage"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              >
                {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Model (optional)</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
                placeholder="e.g. Trilock TL-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">One-line summary</label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-500">Steps</label>
              <button onClick={addStep} className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium">
                <Plus className="w-3 h-3" /> Add step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="border border-stone-200 rounded-md p-2.5 space-y-2 bg-stone-50">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <textarea
                      value={step.text}
                      onChange={(e) => updateStep(idx, "text", e.target.value)}
                      rows={2}
                      placeholder={`Step ${idx + 1}…`}
                      className="flex-1 border border-stone-300 rounded-md px-2.5 py-1.5 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                    />
                    <button
                      onClick={() => removeStep(idx)}
                      className="text-stone-300 hover:text-rose-600 transition mt-0.5 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {step.image ? (
                    <div className="relative inline-block ml-7">
                      <img src={step.image} alt="" className="h-20 rounded-md border border-stone-300 object-cover" />
                      <button
                        onClick={() => updateStep(idx, "image", null)}
                        className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="ml-7">
                      <input
                        ref={(el) => (stepFileRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStepImage(idx, e.target.files)}
                      />
                      <button
                        onClick={() => stepFileRefs.current[idx]?.click()}
                        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-700 transition"
                      >
                        {uploadingStep === idx ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ImagePlus className="w-3 h-3" />
                        )}
                        Add image to this step
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Tags (comma separated)</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder="e.g. battery, smart lock"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Linked products</label>
            {productIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1.5">
                {productIds.map((id) => {
                  const p = (allProducts || []).find((pp) => pp.id === id);
                  if (!p) return null;
                  return (
                    <span key={id} className="flex items-center gap-1 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 pl-2 pr-1 py-1 rounded-full">
                      {p.name}
                      <button
                        onClick={() => setProductIds((prev) => prev.filter((x) => x !== id))}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products this applies to…"
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
            {productSearch.trim() && (
              <div className="border border-stone-200 rounded-md mt-1 max-h-32 overflow-y-auto">
                {productCandidates.length === 0 ? (
                  <div className="px-2.5 py-2 text-xs text-stone-400">No matches</div>
                ) : (
                  productCandidates.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setProductIds((prev) => [...prev, p.id]); setProductSearch(""); }}
                      className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-0"
                    >
                      {p.name} {p.model && <span className="text-stone-400 text-xs">({p.model})</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Photos</label>
            <ImagePicker images={images} setImages={setImages} />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} />
            Flag for escalation
          </label>
          <button
            onClick={submit}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium py-2 rounded-md transition mt-2"
          >
            {initial ? "Save changes" : "Save entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductFormModal({ initial, allProducts, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "levers");
  const [brand, setBrand] = useState(initial?.brand || BRANDS[0]);
  const [model, setModel] = useState(initial?.model || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [finishesText, setFinishesText] = useState((initial?.finishes || []).join(", "));
  const [specsText, setSpecsText] = useState(
    Object.entries(initial?.specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n")
  );
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(", "));
  const [images, setImages] = useState(initial?.images || []);
  const [relatedIds, setRelatedIds] = useState(initial?.relatedIds || []);
  const [relatedSearch, setRelatedSearch] = useState("");

  const candidates = (allProducts || [])
    .filter((p) => p.id !== initial?.id && !relatedIds.includes(p.id))
    .filter((p) => !relatedSearch.trim() || p.name.toLowerCase().includes(relatedSearch.trim().toLowerCase()))
    .slice(0, 6);

  const submit = () => {
    if (!name.trim()) return;
    const specs = {};
    specsText.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k && v) specs[k] = v;
      }
    });
    onSave({
      name: name.trim(),
      category,
      brand,
      model: model.trim(),
      description: description.trim(),
      finishes: finishesText.split(",").map((f) => f.trim()).filter(Boolean),
      specs,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      images,
      relatedIds,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="border-b-4 border-amber-700 bg-stone-900 text-white px-5 py-3 flex items-center justify-between">
          <span className="font-display font-semibold">{initial ? "Edit product" : "New product"}</span>
          <button onClick={onClose} className="text-stone-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-500">Product name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder="e.g. Trilock Freestyle"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              >
                {CATEGORIES.filter((c) => c.id !== "all" && c.id !== "policy").map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder="e.g. FX-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Finishes (comma separated)</label>
            <input
              value={finishesText}
              onChange={(e) => setFinishesText(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder="e.g. Matte Black, Satin Chrome"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Specs (one per line, "label: value")</label>
            <textarea
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              rows={3}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
              placeholder={"Backset: 60mm\nDoor thickness: 35-50mm"}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Tags (comma separated)</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Linked products (e.g. matching latch, deadbolt)</label>
            {relatedIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1.5">
                {relatedIds.map((id) => {
                  const p = (allProducts || []).find((pp) => pp.id === id);
                  if (!p) return null;
                  return (
                    <span key={id} className="flex items-center gap-1 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 pl-2 pr-1 py-1 rounded-full">
                      {p.name}
                      <button
                        onClick={() => setRelatedIds((prev) => prev.filter((x) => x !== id))}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              value={relatedSearch}
              onChange={(e) => setRelatedSearch(e.target.value)}
              placeholder="Search products to link…"
              className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
            {relatedSearch.trim() && (
              <div className="border border-stone-200 rounded-md mt-1 max-h-32 overflow-y-auto">
                {candidates.length === 0 ? (
                  <div className="px-2.5 py-2 text-xs text-stone-400">No matches</div>
                ) : (
                  candidates.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setRelatedIds((prev) => [...prev, p.id]); setRelatedSearch(""); }}
                      className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-0"
                    >
                      {p.name} {p.model && <span className="text-stone-400 text-xs">({p.model})</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500">Photos</label>
            <ImagePicker images={images} setImages={setImages} />
          </div>
          <button
            onClick={submit}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium py-2 rounded-md transition mt-2"
          >
            {initial ? "Save changes" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState("reference");

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [stepStatus, setStepStatus] = useState({});

  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [productBrand, setProductBrand] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productNoteDraft, setProductNoteDraft] = useState("");

  const [toast, setToast] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTag, setNoteTag] = useState("all");
  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [callerEmail, setCallerEmail] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [headerH, setHeaderH] = useState(72);
  const headerRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const update = () => setHeaderH(headerRef.current.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(headerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let loadedEntries = SEED_ENTRIES;
      try {
        const res = await window.storage.get("reference-entries", false);
        if (res && res.value) loadedEntries = JSON.parse(res.value);
      } catch (e) {
        try { await window.storage.set("reference-entries", JSON.stringify(SEED_ENTRIES), false); } catch (e2) {}
      }
      let loadedProducts = SEED_PRODUCTS;
      try {
        const resP = await window.storage.get("products", false);
        if (resP && resP.value) loadedProducts = JSON.parse(resP.value);
      } catch (e) {
        try { await window.storage.set("products", JSON.stringify(SEED_PRODUCTS), false); } catch (e2) {}
      }
      let loadedNotes = [];
      try {
        const res2 = await window.storage.get("call-notes", false);
        if (res2 && res2.value) loadedNotes = JSON.parse(res2.value);
      } catch (e) {}
      if (mounted) {
        setEntries(loadedEntries);
        setProducts(loadedProducts);
        setNotes(loadedNotes);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const persistEntries = async (next) => {
    setEntries(next);
    try { await window.storage.set("reference-entries", JSON.stringify(next), false); } catch (e) {}
  };

  const persistProducts = async (next) => {
    setProducts(next);
    try { await window.storage.set("products", JSON.stringify(next), false); } catch (e) {}
  };

  const persistNotes = async (next) => {
    setNotes(next);
    try { await window.storage.set("call-notes", JSON.stringify(next), false); } catch (e) {}
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeCategory !== "all" && e.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [e.title, e.model, e.summary, ...(e.tags || []), ...(e.steps || []).map((s) => typeof s === "string" ? s : s.text)].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query, activeCategory]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (productCategory !== "all" && p.category !== productCategory) return false;
      if (productBrand !== "all" && p.brand !== productBrand) return false;
      if (!q) return true;
      const haystack = [p.name, p.model, p.brand, p.description, ...(p.tags || []), ...(p.finishes || []), ...Object.values(p.specs || {})]
        .join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [products, productQuery, productCategory, productBrand]);

  const availableProductCategories = useMemo(() => {
    const relevant = productBrand === "all" ? products : products.filter((p) => p.brand === productBrand);
    const present = new Set(relevant.map((p) => p.category));
    return CATEGORIES.filter((c) => c.id !== "all" && c.id !== "policy" && present.has(c.id));
  }, [products, productBrand]);

  useEffect(() => {
    if (productCategory !== "all" && !availableProductCategories.some((c) => c.id === productCategory)) {
      setProductCategory("all");
    }
  }, [availableProductCategories, productCategory]);

  const selected = entries.find((e) => e.id === selectedId) || null;
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  const relatedFor = (product) => {
    if (!product) return [];
    const direct = (product.relatedIds || []).map((id) => products.find((p) => p.id === id)).filter(Boolean);
    const reverse = products.filter((p) => (p.relatedIds || []).includes(product.id));
    const merged = [...direct, ...reverse];
    const seen = new Set();
    return merged.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  };

  const productsForEntry = (entry) => {
    if (!entry) return [];
    return (entry.productIds || []).map((id) => products.find((p) => p.id === id)).filter(Boolean);
  };

  const entriesForProduct = (product) => {
    if (!product) return [];
    return entries.filter((e) => (e.productIds || []).includes(product.id));
  };

  const openProduct = (id) => {
    setSelectedId(null);
    setTab("products");
    setSelectedProductId(id);
  };

  const openEntry = (id) => {
    setSelectedProductId(null);
    setTab("reference");
    setSelectedId(id);
  };

  useEffect(() => {
    setStepStatus({});
  }, [selectedId]);

  useEffect(() => {
    setProductNoteDraft("");
  }, [selectedProductId]);

  const addProductNote = (productId, text) => {
    if (!text.trim()) return;
    const next = products.map((p) =>
      p.id === productId
        ? { ...p, notes: [{ id: "pn" + Date.now(), text: text.trim(), ts: Date.now() }, ...(p.notes || [])] }
        : p
    );
    persistProducts(next);
    setProductNoteDraft("");
  };

  const deleteProductNote = (productId, noteId) => {
    const next = products.map((p) =>
      p.id === productId ? { ...p, notes: (p.notes || []).filter((n) => n.id !== noteId) } : p
    );
    persistProducts(next);
  };

  const toggleStep = (idx, status) => {
    setStepStatus((prev) => {
      const next = { ...prev };
      if (next[idx] === status) {
        delete next[idx];
      } else {
        next[idx] = status;
      }
      return next;
    });
  };

  const saveEntry = (data, editingId) => {
    if (editingId) {
      persistEntries(entries.map((e) => (e.id === editingId ? { ...e, ...data } : e)));
      showToast("Reference updated");
    } else {
      persistEntries([{ ...data, id: "c" + Date.now() }, ...entries]);
      showToast("Reference added");
    }
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const deleteEntry = (id) => {
    persistEntries(entries.filter((e) => e.id !== id));
    setSelectedId(null);
    showToast("Reference removed");
  };

  const saveProduct = (data, editingId) => {
    if (editingId) {
      persistProducts(products.map((p) => (p.id === editingId ? { ...p, ...data } : p)));
      showToast("Product updated");
    } else {
      persistProducts([{ ...data, id: "cp" + Date.now() }, ...products]);
      showToast("Product added");
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id) => {
    persistProducts(products.filter((p) => p.id !== id));
    setSelectedProductId(null);
    showToast("Product removed");
  };

  const copyToNotes = (entry) => {
    const text = `[${categoryLabel(entry.category)}] ${entry.title}`;
    const stepResults = Object.entries(stepStatus)
      .map(([idx, status]) => {
        const raw = entry.steps[Number(idx)];
        const text = raw ? (typeof raw === "string" ? raw : raw.text) : null;
        return { order: Number(idx), status, text };
      })
      .filter((r) => r.text)
      .sort((a, b) => a.order - b.order)
      .map(({ status, text }) => ({ status, text }));
    persistNotes([{ id: "n" + Date.now(), text, tag: entry.category, ts: Date.now(), stepResults }, ...notes]);
    showToast("Added to call notes");
  };

  const copyProductToNotes = (product) => {
    const text = `[${categoryLabel(product.category)}] ${product.name}${product.model ? " — " + product.model : ""}`;
    persistNotes([{ id: "n" + Date.now(), text, tag: product.category, ts: Date.now() }, ...notes]);
    showToast("Added to call notes");
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    persistNotes([{ id: "n" + Date.now(), text: noteDraft.trim(), tag: noteTag, ts: Date.now() }, ...notes]);
    setNoteDraft("");
    showToast("Note saved");
  };

  const newCall = () => {
    if (notes.length > 0 || callerName || callerPhone || callerEmail) {
      if (!window.confirm("Start a new call? This will clear all current notes and caller info.")) return;
    }
    persistNotes([]);
    setCallerName("");
    setCallerPhone("");
    setCallerEmail("");
    setNoteDraft("");
    setNoteTag("all");
    showToast("Ready for new call");
  };

  const exportCallPDF = () => {
    const now = new Date();
    const dateStr = now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    const rows = notes.map((n) => {
      const steps = (n.stepResults || [])
        .map((r) => `<div class="step-result ${r.status}"><span class="icon">${r.status === "done" ? "✓" : "✗"}</span> ${r.text}</div>`)
        .join("");
      return `
        <div class="note">
          <div class="note-meta">${categoryLabel(n.tag)} · ${formatTime(n.ts)}</div>
          <div class="note-text">${n.text}</div>
          ${steps ? `<div class="step-results">${steps}</div>` : ""}
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Call Notes — ${callerName || "Unknown Caller"}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; color: #1c1917; margin: 0; padding: 32px; }
      h1 { font-size: 20px; font-weight: bold; margin: 0 0 4px; }
      .subtitle { color: #78716c; font-size: 12px; margin-bottom: 24px; }
      .caller-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #f5f5f4; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
      .caller-field label { font-size: 10px; text-transform: uppercase; color: #a8a29e; font-weight: bold; display: block; margin-bottom: 2px; }
      .caller-field span { font-size: 13px; font-weight: 600; }
      h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #a8a29e; margin: 0 0 12px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; }
      .note { border: 1px solid #e7e5e4; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
      .note-meta { font-size: 10px; color: #a8a29e; margin-bottom: 4px; }
      .note-text { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
      .step-results { margin-top: 6px; padding-top: 6px; border-top: 1px solid #f5f5f4; }
      .step-result { font-size: 12px; padding: 2px 0; display: flex; gap: 6px; }
      .step-result.done { color: #16a34a; }
      .step-result.failed { color: #dc2626; }
      .icon { width: 14px; shrink: 0; }
      .empty { color: #a8a29e; font-style: italic; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>Call Notes</h1>
    <div class="subtitle">Exported ${dateStr}</div>
    <div class="caller-grid">
      <div class="caller-field"><label>Name</label><span>${callerName || "—"}</span></div>
      <div class="caller-field"><label>Phone</label><span>${callerPhone || "—"}</span></div>
      <div class="caller-field"><label>Email</label><span>${callerEmail || "—"}</span></div>
    </div>
    <h2>Notes</h2>
    ${rows || '<div class="empty">No notes recorded for this call.</div>'}
    </body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const deleteNote = (id) => {
    persistNotes(notes.filter((n) => n.id !== id));
  };

  const exportData = () => {
    const payload = JSON.stringify({ entries, products, notes }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quickref-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Exported quickref-data.json");
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.entries)) persistEntries(parsed.entries);
        if (Array.isArray(parsed.products)) persistProducts(parsed.products);
        if (Array.isArray(parsed.notes)) persistNotes(parsed.notes);
        showToast("Import successful");
      } catch (err) {
        showToast("Import failed — check the file");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
      </div>
    );
  }

  const tabBtn = (id, label) => (
    <button
      onClick={() => { setTab(id); setSelectedId(null); setSelectedProductId(null); }}
      className={`px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap ${
        tab === id ? "bg-amber-700 text-white" : "text-stone-300 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-mono-brand { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <header ref={headerRef} className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b-4 border-amber-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-display uppercase tracking-wide text-lg sm:text-xl font-semibold">QuickRef</div>
              <div className="text-stone-400 text-xs sm:text-sm">Door Hardware Service Desk</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) importData(e.target.files[0]);
                  e.target.value = "";
                }}
              />
              <button onClick={exportData} title="Export all data" className="text-stone-300 hover:text-white">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => importInputRef.current?.click()} title="Import data" className="text-stone-300 hover:text-white">
                <Upload className="w-4 h-4" />
              </button>
              <nav className="flex gap-1 bg-stone-800 rounded-md p-1">
                {tabBtn("products", "Products")}
                {tabBtn("reference", "Reference")}
                {tabBtn("notes", `Notes${notes.length ? ` (${notes.length})` : ""}`)}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === "products" ? (
          <>
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search products by name, model, or finish…"
                className="w-full bg-white border border-stone-300 rounded-md pl-9 pr-9 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
              />
              {productQuery && (
                <button onClick={() => setProductQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-stone-400 shrink-0">Brand</span>
              <button
                onClick={() => setProductBrand("all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  productBrand === "all" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                }`}
              >
                All
              </button>
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setProductBrand(b)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    productBrand === b ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-stone-400 shrink-0">Category</span>
              <button
                onClick={() => setProductCategory("all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  productCategory === "all" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                }`}
              >
                All
              </button>
              {availableProductCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setProductCategory(c.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    productCategory === c.id ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-stone-500">{filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}</div>
              <button
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900"
              >
                <Plus className="w-3.5 h-3.5" /> Add product
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Package className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">No matches. Try a different term, or add a new product.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map((p) => {
                  const style = CATEGORY_STYLE[p.category] || CATEGORY_STYLE.policy;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className="text-left bg-white border border-stone-300 rounded-lg overflow-hidden hover:border-amber-700 hover:shadow-md transition shadow-sm"
                    >
                      <div className="relative h-96 bg-stone-100 border-b border-stone-200">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-stone-300" />
                          </div>
                        )}
                        {p.images && p.images.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                            +{p.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <span className={`text-[11px] uppercase tracking-wide font-semibold ${style.text}`}>{categoryLabel(p.category)}</span>
                          {p.brand && (
                            <span className={`text-[10px] font-semibold border px-1.5 py-0.5 rounded-full ${BRAND_STYLE[p.brand] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
                              {p.brand}
                            </span>
                          )}
                        </div>
                        <div className="font-display font-semibold text-stone-900 text-sm leading-snug mb-1">{p.name}</div>
                        {p.model && (
                          <div className="font-mono-brand text-[11px] text-stone-500 bg-stone-100 inline-block px-1.5 py-0.5 rounded mb-1.5">{p.model}</div>
                        )}
                        <div className="text-xs text-stone-600">{p.description}</div>
                        {p.finishes && p.finishes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.finishes.slice(0, 3).map((f) => (
                              <span key={f} className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-full">{f}</span>
                            ))}
                            {p.finishes.length > 3 && <span className="text-[10px] text-stone-400 self-center">+{p.finishes.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : tab === "reference" ? (
          <>
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by issue, product, or model number…"
                className="w-full bg-white border border-stone-300 rounded-md pl-9 pr-9 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    activeCategory === c.id ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-stone-500">{filtered.length} {filtered.length === 1 ? "result" : "results"}</div>
              <button
                onClick={() => { setEditingEntry(null); setShowEntryForm(true); }}
                className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900"
              >
                <Plus className="w-3.5 h-3.5" /> Add reference
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">No matches. Try a different term, or add a new entry.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((e) => {
                  const style = CATEGORY_STYLE[e.category] || CATEGORY_STYLE.policy;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className="relative text-left bg-white border border-stone-300 rounded-lg p-4 hover:border-amber-700 hover:shadow-md transition shadow-sm"
                    >
                      <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                      <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                      <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span className={`text-[11px] uppercase tracking-wide font-semibold ${style.text}`}>{categoryLabel(e.category)}</span>
                        {e.escalate && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 ml-auto" />}
                      </div>
                      <div className="font-display font-semibold text-stone-900 text-sm leading-snug mb-1">{e.title}</div>
                      {e.model && (
                        <div className="font-mono-brand text-[11px] text-stone-500 bg-stone-100 inline-block px-1.5 py-0.5 rounded mb-1.5">{e.model}</div>
                      )}
                      <div className="text-xs text-stone-600">{e.summary}</div>
                      {e.images && e.images.length > 0 && (
                        <div className="flex gap-1 mt-2 items-center">
                          {e.images.slice(0, 3).map((src, i) => (
                            <img key={i} src={src} alt="" className="w-9 h-9 object-cover rounded border border-stone-200" />
                          ))}
                          {e.images.length > 3 && <span className="text-[10px] text-stone-400">+{e.images.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Caller info card */}
            <div className="bg-white border border-stone-300 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Caller details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 font-semibold">Name</label>
                  <input
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-semibold">Phone</label>
                  <input
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="04xx xxx xxx"
                    className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-semibold">Email</label>
                  <input
                    value={callerEmail}
                    onChange={(e) => setCallerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-stone-300 rounded-md px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Note input card */}
            <div className="bg-white border border-stone-300 rounded-lg p-4 mb-4">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Jot a quick note for this call…"
                rows={3}
                className="w-full text-sm border border-stone-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
              />
              <div className="flex items-center justify-between mt-2">
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="text-xs border border-stone-300 rounded-md px-2 py-1.5 text-stone-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <button
                  onClick={addNote}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-1.5 rounded-md transition"
                >
                  Add note
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={exportCallPDF}
                className="flex-1 flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-md transition"
              >
                <Download className="w-3.5 h-3.5" /> Save / Send note
              </button>
              <button
                onClick={newCall}
                className="flex items-center justify-center gap-1.5 border border-stone-300 text-stone-600 hover:border-rose-400 hover:text-rose-600 text-sm font-medium px-4 py-2 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" /> New call
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">No notes yet — they'll show up here as you add them during the call.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => {
                  const style = CATEGORY_STYLE[n.tag] || CATEGORY_STYLE.policy;
                  return (
                    <div key={n.id} className="bg-white border border-stone-300 rounded-lg p-3 flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-stone-800 break-words">{n.text}</div>
                        {n.stepResults && n.stepResults.length > 0 && (
                          <ul className="mt-1.5 space-y-1">
                            {n.stepResults.map((r, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs">
                                {r.status === "done" ? (
                                  <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                ) : (
                                  <X className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />
                                )}
                                <span className={r.status === "done" ? "text-stone-500" : "text-rose-700"}>{r.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-400">
                          <Clock className="w-3 h-3" /> {formatTime(n.ts)} · {categoryLabel(n.tag)}
                        </div>
                      </div>
                      <button onClick={() => deleteNote(n.id)} className="text-stone-300 hover:text-rose-600 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 bg-black/30 z-10"
            style={{ top: headerH }}
            onClick={() => setSelectedId(null)}
          />
          <div
            className="fixed right-0 w-full sm:w-[26rem] bg-white shadow-2xl z-20 overflow-y-auto"
            style={{ top: headerH, height: `calc(100% - ${headerH}px)` }}
          >
            <div className="border-b-4 border-amber-700 bg-stone-900 text-white px-5 py-4 flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#d6a85c" }}>{categoryLabel(selected.category)}</div>
                <div className="font-display font-semibold text-lg leading-snug mt-0.5">{selected.title}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {selected.model && (
                <div className="font-mono-brand text-xs text-stone-500 bg-stone-100 inline-block px-2 py-1 rounded mb-3">{selected.model}</div>
              )}
              {selected.escalate && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md p-3 mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>If the steps below don't resolve it, escalate to Technical Support — don't advise the customer to force or drill the lock.</span>
                </div>
              )}
              {selected.images && selected.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-4">
                  {selected.images.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setLightbox(src)} className="w-20 h-20 object-cover rounded-md border border-stone-300 cursor-pointer shrink-0" />
                  ))}
                </div>
              )}
              <div className="text-sm text-stone-600 mb-4">{selected.summary}</div>
              <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Steps</div>
              <ol className="space-y-2 mb-5">
                {(selected.steps || []).map((s, i) => {
                  const stepText = typeof s === "string" ? s : s.text;
                  const stepImage = typeof s === "string" ? null : s.image;
                  const status = stepStatus[i];
                  return (
                    <li
                      key={i}
                      className={`rounded-md p-1.5 -mx-1.5 transition ${
                        status === "failed" ? "bg-rose-50" : status === "done" ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`shrink-0 w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center mt-0.5 ${
                            status === "done" ? "bg-emerald-600 text-white" : status === "failed" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {status === "done" ? <Check className="w-3 h-3" /> : status === "failed" ? <X className="w-3 h-3" /> : i + 1}
                        </span>
                        <span className={`text-sm flex-1 ${status === "done" ? "text-stone-400 line-through" : status === "failed" ? "text-rose-800" : "text-stone-800"}`}>
                          {stepText}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => toggleStep(i, "done")}
                            title="Mark done"
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${
                              status === "done" ? "bg-emerald-600 border-emerald-600 text-white" : "border-stone-300 text-stone-400 hover:border-emerald-400 hover:text-emerald-600"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleStep(i, "failed")}
                            title="Mark not working"
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${
                              status === "failed" ? "bg-rose-600 border-rose-600 text-white" : "border-stone-300 text-stone-400 hover:border-rose-400 hover:text-rose-600"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {stepImage && (
                        <div className="mt-2 ml-7">
                          <img
                            src={stepImage}
                            alt={`Step ${i + 1} reference`}
                            onClick={() => setLightbox(stepImage)}
                            className="max-h-48 rounded-md border border-stone-200 object-contain cursor-pointer hover:opacity-90 transition"
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selected.tags.map((t) => (
                    <span key={t} className="text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}
              {productsForEntry(selected).length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Related products</div>
                  <div className="space-y-2 mb-5">
                    {productsForEntry(selected).map((rp) => (
                      <button
                        key={rp.id}
                        onClick={() => openProduct(rp.id)}
                        className="w-full flex items-center gap-3 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md p-2.5 transition"
                      >
                        {rp.images && rp.images[0] ? (
                          <img src={rp.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded border border-stone-200 bg-white flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-stone-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-stone-800 truncate">{rp.name}</div>
                          {rp.model && <div className="text-[11px] text-stone-400 font-mono-brand">{rp.model}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => copyToNotes(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-3 py-2 rounded-md transition"
                >
                  <Copy className="w-3.5 h-3.5" /> Add to call notes
                </button>
                <button
                  onClick={() => { setEditingEntry(selected); setShowEntryForm(true); }}
                  className="px-3 py-2 rounded-md border border-stone-300 text-stone-500 hover:text-amber-700 hover:border-amber-300 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {selected.id.startsWith("c") && (
                  <button
                    onClick={() => deleteEntry(selected.id)}
                    className="px-3 py-2 rounded-md border border-stone-300 text-stone-500 hover:text-rose-600 hover:border-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-10"
            onClick={() => setSelectedProductId(null)}
          />
          <div
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[36rem] bg-white shadow-2xl z-20 rounded-xl overflow-hidden flex flex-col"
            style={{ top: headerH + 16, maxHeight: `calc(100% - ${headerH + 32}px)` }}
          >
            <div className="border-b-4 border-amber-700 bg-stone-900 text-white px-5 py-4 flex items-start justify-between shrink-0">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#d6a85c" }}>
                  {categoryLabel(selectedProduct.category)}{selectedProduct.brand ? ` · ${selectedProduct.brand}` : ""}
                </div>
                <div className="font-display font-semibold text-lg leading-snug mt-0.5">{selectedProduct.name}</div>
              </div>
              <button onClick={() => setSelectedProductId(null)} className="text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {selectedProduct.model && (
                <div className="font-mono-brand text-xs text-stone-500 bg-stone-100 inline-block px-2 py-1 rounded mb-3">{selectedProduct.model}</div>
              )}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-4">
                  {selectedProduct.images.map((src, i) => (
                    <img key={i} src={src} alt="" onClick={() => setLightbox(src)} className="w-24 h-24 object-cover rounded-md border border-stone-300 cursor-pointer shrink-0" />
                  ))}
                </div>
              )}
              {selectedProduct.description && <div className="text-sm text-stone-600 mb-4">{selectedProduct.description}</div>}

              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Specs</div>
                  <dl className="space-y-1.5 mb-5">
                    {Object.entries(selectedProduct.specs).map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-3 text-sm border-b border-stone-100 pb-1.5">
                        <dt className="text-stone-500 shrink-0">{k}</dt>
                        <dd className="text-stone-800 font-medium text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}

              {selectedProduct.finishes && selectedProduct.finishes.length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Finishes</div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedProduct.finishes.map((f) => (
                      <span key={f} className="text-[11px] text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </>
              )}

              {relatedFor(selectedProduct).length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Used with</div>
                  <div className="space-y-2 mb-5">
                    {relatedFor(selectedProduct).map((rp) => (
                      <button
                        key={rp.id}
                        onClick={() => setSelectedProductId(rp.id)}
                        className="w-full flex items-center gap-3 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md p-2.5 transition"
                      >
                        {rp.images && rp.images[0] ? (
                          <img src={rp.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded border border-stone-200 bg-white flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-stone-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-stone-800 truncate">{rp.name}</div>
                          {rp.model && <div className="text-[11px] text-stone-400 font-mono-brand">{rp.model}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {entriesForProduct(selectedProduct).length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Related troubleshooting</div>
                  <div className="space-y-2 mb-5">
                    {entriesForProduct(selectedProduct).map((re) => (
                      <button
                        key={re.id}
                        onClick={() => openEntry(re.id)}
                        className="w-full flex items-center gap-3 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md p-2.5 transition"
                      >
                        <div className="w-10 h-10 rounded border border-stone-200 bg-white flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-stone-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-stone-800 truncate">{re.title}</div>
                          {re.escalate && <div className="text-[11px] text-rose-600">Escalation flagged</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="text-xs uppercase tracking-wide font-semibold text-stone-400 mb-2">Notes</div>
              <div className="mb-5">
                <textarea
                  value={productNoteDraft}
                  onChange={(e) => setProductNoteDraft(e.target.value)}
                  placeholder="e.g. often confused with Mode, check stock before quoting…"
                  rows={2}
                  className="w-full text-sm border border-stone-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={() => addProductNote(selectedProduct.id, productNoteDraft)}
                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                  >
                    Add note
                  </button>
                </div>
                {(selectedProduct.notes || []).length > 0 && (
                  <div className="space-y-2 mt-3">
                    {selectedProduct.notes.map((n) => (
                      <div key={n.id} className="bg-stone-50 border border-stone-200 rounded-md p-2.5 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-stone-800 break-words">{n.text}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400">
                            <Clock className="w-3 h-3" /> {formatTime(n.ts)}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteProductNote(selectedProduct.id, n.id)}
                          className="text-stone-300 hover:text-rose-600 transition shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyProductToNotes(selectedProduct)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-3 py-2 rounded-md transition"
                >
                  <Copy className="w-3.5 h-3.5" /> Add to call notes
                </button>
                <button
                  onClick={() => { setEditingProduct(selectedProduct); setShowProductForm(true); }}
                  className="px-3 py-2 rounded-md border border-stone-300 text-stone-500 hover:text-amber-700 hover:border-amber-300 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {selectedProduct.id.startsWith("cp") && (
                  <button
                    onClick={() => deleteProduct(selectedProduct.id)}
                    className="px-3 py-2 rounded-md border border-stone-300 text-stone-500 hover:text-rose-600 hover:border-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showEntryForm && (
        <EntryFormModal
          initial={editingEntry}
          allProducts={products}
          onClose={() => { setShowEntryForm(false); setEditingEntry(null); }}
          onSave={(data) => saveEntry(data, editingEntry?.id)}
        />
      )}

      {showProductForm && (
        <ProductFormModal
          initial={editingProduct}
          allProducts={products}
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSave={(data) => saveProduct(data, editingProduct?.id)}
        />
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-md" />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm px-4 py-2 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
