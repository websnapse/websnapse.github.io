<template>
    <div class="w-screen h-10 bg-gray-200 flex justify-start items-center px-5 gap-10">
        <div class="h-full w-fit flex items-center font-bold text-2xl ">WebSnapse</div>
        <div>
            <button @click="changeActiveMode('default');"
                :class="mode == 'default' ? 'nav-button active' : 'nav-button inactive'">
                <v-icon name="bi-cursor-fill" />
            </button>

            <button @click="changeActiveMode('add');" :class="mode == 'add' ? 'nav-button active' : 'nav-button inactive'">
                <v-icon name="bi-plus-circle" />
            </button>

            <button @click="changeActiveMode('remove');"
                :class="mode == 'remove' ? 'nav-button active' : 'nav-button inactive'">
                <v-icon name="bi-x-circle" />
            </button>

            <button class="nav-button inactive">
                <v-icon name="bi-arrow-counterclockwise" />
            </button>

            <button class="nav-button inactive">
                <v-icon name="bi-arrow-clockwise" />
            </button>

            <button @click="clearAll" class="nav-button inactive">
                <v-icon name="bi-trash" />
            </button>

            <button class="nav-button inactive">
                <v-icon name="bi-upload" />
            </button>

            <button class="nav-button inactive">
                <v-icon name="bi-download" />
            </button>
        </div>



    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['changeMode', 'clear'])

const mode = ref('default');
const clear_all = ref(false);

const changeActiveMode = (new_mode) => {
    mode.value = new_mode;
    emit('changeMode', new_mode);
}

const clearAll = () => {
    emit('clear');
}

</script>