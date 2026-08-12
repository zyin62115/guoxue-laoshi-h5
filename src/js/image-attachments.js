(function initializeImageAttachments(global) {
  const DB_NAME = "guoxueImageAttachmentsV1";
  const STORE_NAME = "images";
  const MAX_SIZE = 10 * 1024 * 1024;
  const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

  function createId() {
    if (global.crypto?.randomUUID) return `image-${global.crypto.randomUUID()}`;
    return `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) {
        reject(new Error("当前浏览器不支持本地图片存储"));
        return;
      }
      const request = global.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("无法打开图片存储"));
    });
  }

  async function readDimensions(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function inspectFile(file) {
    if (!ACCEPTED_TYPES.has(file?.type)) {
      throw new Error("仅支持 JPG、PNG 或 WebP 图片");
    }
    if (file.size > MAX_SIZE) throw new Error("图片大小不能超过 10MB");
    const dimensions = await readDimensions(file);
    return {
      file,
      name: file.name || "咨询图片",
      type: file.type,
      size: file.size,
      ...dimensions,
    };
  }

  async function save(selection) {
    const id = createId();
    const database = await openDatabase();
    try {
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put({ id, blob: selection.file });
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("图片保存失败"));
        transaction.onabort = () => reject(transaction.error || new Error("图片保存失败"));
      });
    } finally {
      database.close();
    }
    return {
      id,
      name: selection.name,
      type: selection.type,
      size: selection.size,
      width: selection.width,
      height: selection.height,
    };
  }

  async function load(id) {
    const database = await openDatabase();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).get(id);
        request.onsuccess = () => resolve(request.result?.blob || null);
        request.onerror = () => reject(request.error || new Error("图片读取失败"));
      });
    } finally {
      database.close();
    }
  }

  function bindComposer({ dock, uploadButton, fileInput, preview, previewImage, previewName, removeButton, onChange, showError }) {
    let selection = null;
    let previewUrl = null;

    function clear() {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      selection = null;
      fileInput.value = "";
      preview.hidden = true;
      dock.classList.remove("has-image");
      onChange();
    }

    uploadButton.addEventListener("click", () => fileInput.click());
    removeButton.addEventListener("click", clear);
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const nextSelection = await inspectFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        selection = nextSelection;
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;
        previewName.textContent = nextSelection.name;
        preview.hidden = false;
        dock.classList.add("has-image");
        onChange();
      } catch (error) {
        fileInput.value = "";
        showError(error.message);
      }
    });

    return {
      clear,
      hasImage: () => Boolean(selection),
      save: () => (selection ? save(selection) : Promise.resolve(null)),
      setDisabled(disabled) {
        uploadButton.disabled = disabled;
        removeButton.disabled = disabled;
      },
    };
  }

  function appendToBubble(bubble, message) {
    const attachment = message.attachments?.[0];
    if (!attachment) return;
    const frame = document.createElement("div");
    frame.className = "message-image-frame is-loading";
    frame.textContent = "图片加载中…";
    bubble.prepend(frame);
    load(attachment.id)
      .then((blob) => {
        if (!blob) throw new Error("missing");
        const url = URL.createObjectURL(blob);
        const image = document.createElement("img");
        image.alt = attachment.name || "用户上传的图片";
        image.src = url;
        image.onload = () => {
          frame.classList.remove("is-loading");
          frame.replaceChildren(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          frame.className = "message-image-frame is-error";
          frame.textContent = "图片暂时无法加载";
        };
      })
      .catch(() => {
        frame.className = "message-image-frame is-error";
        frame.textContent = "图片暂时无法加载";
      });
  }

  global.GuoxueImageAttachments = Object.freeze({ appendToBubble, bindComposer });
})(window);
