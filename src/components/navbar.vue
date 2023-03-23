<template>
    <div class="w-screen h-10 bg-gray-200 flex justify-start items-center px-5 gap-10">
        <div class="h-full w-fit flex items-center font-bold text-2xl ">WebSnapse</div>
        <div class="flex gap-4">
            <button>
                <v-icon name="bi-plus-circle" />
            </button>
            <button>
                <v-icon name="bi-x-circle" />
            </button>

            <button>
                <v-icon name="bi-arrow-counterclockwise" />
            </button>

            <button>
                <v-icon name="bi-arrow-clockwise" />
            </button>

            <button>
                <v-icon name="bi-trash" />
            </button>

            <button>
                <v-icon name="bi-upload" />
            </button>

            <button>
                <v-icon name="bi-download" />
            </button>
        </div>



    </div>
</template>

<script>
export default {
    name: "navbar",
};
</script>