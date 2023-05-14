<script lang="ts">
  import { FrownIcon } from "svelte-feather-icons"

  import { PopupState } from "~model/popup-state"

  export let popupState: PopupState
</script>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg max-w-lg w-64 h-80">
  <div class="px-5 py-5">
    <div class="flex flex-col items-center justify-center w-full h-full">
      <div>
        <FrownIcon class="text-black dark:text-white h-32 w-32" />
      </div>
      <p class="p-4 font-sans text-lg text-black dark:text-white text-center">
        {#if popupState === PopupState.UnsupportedPage}
          Không hỗ trợ trang này
        {:else}
          Không có dữ liệu cho sản phẩm này
        {/if}
      </p>
    </div>
  </div>
</div>
