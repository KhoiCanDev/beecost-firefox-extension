<script lang="ts">
  import { LoaderIcon } from "svelte-feather-icons"
</script>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg max-w-lg w-64 h-80">
  <div class="px-5 py-5 h-full">
    <div class="flex flex-col items-center justify-center w-full h-full">
      <div class="loading-spin-animation">
        <LoaderIcon class="text-black dark:text-white h-32 w-32" />
      </div>
      <p class="p-4 font-sans text-lg text-black dark:text-white text-center">
        Đang tải dữ liệu...
      </p>
    </div>
  </div>
</div>

<style lang="postcss">
  .loading-spin-animation {
    animation: spin 4s infinite linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
