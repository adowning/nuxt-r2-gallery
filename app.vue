<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="container mx-auto p-4">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-800">R2 Image Gallery</h1>
      <p v-if="pending" class="text-gray-600">Loading images...</p>
      <p v-if="error" class="text-red-500">
        Error loading images: {{ error.message }}
      </p>
    </header>

    <div
      v-if="images && images.length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="image in images"
        :key="image.key"
        class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
      >
        <img
          :src="image.url"
          :alt="image.key"
          class="w-full h-48 object-cover"
          @error="onImageError(image)"
        />
        <div class="p-3">
          <p class="text-sm text-gray-700 truncate" :title="image.key">
            {{ image.key }}
          </p>
          <p class="text-xs text-gray-500">
            Size: {{ formatBytes(image.size) }}
          </p>
          <p v-if="image.uploaded" class="text-xs text-gray-500">
            Uploaded: {{ new Date(image.uploaded).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
    <div v-else-if="!pending && !error" class="text-center text-gray-500">
      <p>No images found in the bucket.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  // import { ref } from "vue";

  interface ImageInfo {
    key: string;
    url: string;
    uploaded?: string | Date;
    size: number;
  }

  const {
    data: images,
    pending,
    error,
    // refresh,
  } = await useFetch<ImageInfo[]>("/api/images", {
    server: false, // Fetch on client-side for this example
  });

  const onImageError = (image: ImageInfo) => {
    console.error(`Failed to load image: ${image.url}`);
    // Optionally, replace with a placeholder image
    // image.url = '/placeholder-image.png';
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Optional: Refresh images periodically or on demand
  // const refreshImages = () => refresh();
</script>

<style>
  /* Basic styling, Tailwind will handle most of it */
  body {
    background-color: #f7fafc; /* Tailwind's gray-100 */
    font-family: "Inter", sans-serif; /* A nice sans-serif font */
  }
</style>
