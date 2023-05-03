<template>
  <Dialog as="div" @close="props.closeModal" class="relative z-10">
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
      <div class="flex min-h-full items-center justify-center p-4 text-center">
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
            class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Node Properties
            </DialogTitle>

            <div class="grid grid-cols-5 mt-4 gap-4">
              <div class="col-span-3">
                <form class="flex flex-col gap-4">
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="default-search"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      Label
                    </label>
                    <input
                      type="search"
                      id="default-search"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="n1"
                      required
                    />
                  </div>
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="default-search"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      Content
                    </label>
                    <input
                      type="search"
                      id="default-search"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="a"
                      required
                    />
                  </div>
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="message"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Rules
                    </label>
                    <textarea
                      id="message"
                      rows="4"
                      class="outline-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="a^2/a^2 \to a;0"
                    />
                  </div>
                </form>
              </div>
              <div class="relative col-span-2 flex items-center justify-center">
                <div
                  class="py-4 px-10 flex items-center flex-col border border-black rounded-3xl"
                >
                  <div class="w-fit">$$ a $$</div>
                  <div class="w-fit mt-4">$$ a^2 \to a $$</div>
                  <div class="w-fit">$$ a^2 \to a $$</div>
                </div>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="props.closeModal"
                >
                  Create
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import {
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

const props = defineProps(['isOpen', 'closeModal']);
</script>
