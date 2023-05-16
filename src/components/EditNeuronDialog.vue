<template>
  <Dialog
    as="div"
    @close="props.closeModal"
    :open="props.isOpen"
    class="relative z-10"
  >
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
      <div class="flex items-center justify-center min-h-full p-4 text-center">
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
            class="w-full max-w-sm p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Node Properties
            </DialogTitle>

            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="col-span-3">
                <form class="flex flex-col gap-4">
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="default-search"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      ID
                    </label>
                    <input
                      type="search"
                      id="default-search"
                      v-model="props.details.id"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
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
                      v-model="props.details.content"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="a"
                      required
                    />
                  </div>
                  <div
                    class="relative flex flex-col gap-1"
                    v-if="props.details.nodeType === 'regular'"
                  >
                    <label
                      for="message"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Rules
                    </label>
                    <textarea
                      id="message"
                      v-model="rules"
                      rows="4"
                      class="outline-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="a^2/a^2 \to a;0"
                    />
                  </div>
                </form>
              </div>
              <!-- <div class="relative flex items-center justify-center col-span-2">
                <div
                  class="flex flex-col items-center px-10 py-4 border border-black rounded-3xl"
                >
                  <div class="w-fit">$$ a $$</div>
                  <div class="mt-4 w-fit">$$ a^2 \to a $$</div>
                  <div class="w-fit">$$ a^2 \to a $$</div>
                </div>
              </div> -->

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="props.closeModal"
                >
                  Update
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

import { computed, watch } from 'vue';

const props = defineProps(['isOpen', 'closeModal', 'details']);

// create computed variable for the rules that joins the array into a string
const rules = computed({
  get: () => props.details?.rules?.join('\n'),
  set: (value) => {
    props.details.rules = value.split('\n');
  },
});

// watch for changes in the rules and update the prop details rules
watch(rules, (value) => {
  props.details.rules = value.split('\n');
});
</script>