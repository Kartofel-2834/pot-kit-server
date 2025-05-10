<script setup lang="ts">
import PotButton from './components/ui/PotButton.vue';
</script>

<template>
    <main class="main">
        <PotButton
            radius="circle"
            color="pot"
            size="medium"
        >
            Normal
        </PotButton>

        <PotButton
            color="pot"
            size="medium"
        >
            Normal
        </PotButton>

        <PotButton
            color="pot"
            size="medium"
            disabled
        >
            Disabled
        </PotButton>
    </main>
</template>

<style>
.main {
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 4rem;
    /* background-color: var(--pot-base-600); */
}
</style>
