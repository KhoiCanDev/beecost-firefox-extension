<script lang="ts">
  import {
    ArrowDownRightIcon,
    ArrowRightIcon,
    ArrowUpRightIcon
  } from "svelte-feather-icons"

  import { PriceStatus } from "~model/price-status"

  export let priceStatus: PriceStatus = PriceStatus.NoChange
</script>

{#if priceStatus === PriceStatus.NowHigh}
  <ArrowUpRightIcon class="text-red-400  h-6 w-6" />
{:else if priceStatus === PriceStatus.NowLow}
  <ArrowDownRightIcon class="text-green-400 h-6 w-6" />
{:else}
  <ArrowRightIcon class="text-yellow-400 h-6 w-6" />
{/if}
