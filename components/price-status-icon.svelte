<script lang="ts">
  import ArrowDownRight from "svelte-bootstrap-icons/lib/ArrowDownRight.svelte"
  import ArrowRight from "svelte-bootstrap-icons/lib/ArrowRight.svelte"
  import ArrowUpRight from "svelte-bootstrap-icons/lib/ArrowUpRight.svelte"

  import { PriceStatus } from "~model/price-status"

  export let priceStatus: PriceStatus = PriceStatus.NoChange
</script>

{#if priceStatus === PriceStatus.NowHigh}
  <ArrowUpRight class="text-red-400  h-6 w-6" />
{:else if priceStatus === PriceStatus.NowLow}
  <ArrowDownRight class="text-green-400 h-6 w-6" />
{:else}
  <ArrowRight class="text-yellow-400 h-6 w-6" />
{/if}
