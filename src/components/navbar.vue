<template>
  <div
    class="w-screen h-10 bg-gray-200 flex justify-start items-center px-5 gap-10"
  >
    <div class="h-full w-fit flex items-center font-bold text-2xl">
      WebSnapse
    </div>
    <div>
      <button
        @click="changeActiveMode('default')"
        :class="mode == 'default' ? 'nav-button active' : 'nav-button inactive'"
      >
        <v-icon name="bi-cursor-fill" />
      </button>

      <button
        @click="changeActiveMode('add')"
        :class="mode == 'add' ? 'nav-button active' : 'nav-button inactive'"
      >
        <v-icon name="bi-plus-circle" />
      </button>

      <button
        @click="changeActiveMode('remove')"
        :class="mode == 'remove' ? 'nav-button active' : 'nav-button inactive'"
      >
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
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Payment successful
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Your payment has been successfully submitted. We’ve sent you
                  an email with all of the details of your order.
                </p>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  Got it, thanks!
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

const isOpen = ref(true);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}

const emit = defineEmits(['changeMode', 'clear']);

const mode = ref('default');
const clear_all = ref(false);

const changeActiveMode = (new_mode) => {
  mode.value = new_mode;
  emit('changeMode', new_mode);
};

const clearAll = () => {
  emit('clear');
};
</script>
