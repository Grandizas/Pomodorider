<template>
    <div class="background">
        <div
            v-for="circle in circles"
            :key="circle.id"
            class="circle"
            :style="{
                left: `${circle.x}%`,
                top: `${circle.y}%`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
            }"
        />
        <div class="background-layer" />
    </div>
</template>

<script setup lang="ts">
const circles = [
    { id: 1,  x: 8,  y: 12, size: 80  },
    { id: 2,  x: 20, y: 55, size: 100 },
    { id: 3,  x: 58, y: 8,  size: 115 },
    { id: 4,  x: 85, y: 70, size: 90  },
    { id: 5,  x: 45, y: 88, size: 75  },
    { id: 6,  x: 92, y: 18, size: 85  },
    { id: 7,  x: 10, y: 86, size: 105 },
    { id: 8,  x: 75, y: 40, size: 70  },
    { id: 9,  x: 36, y: 30, size: 95  },
    { id: 10, x: 65, y: 72, size: 80  },
];
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_background.scss';
</style>
