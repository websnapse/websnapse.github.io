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
            <DialogTitle as="h3" class="text-lg font-medium leading-6">
              Node Properties
            </DialogTitle>

            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="col-span-3">
                <form class="flex flex-col gap-4">
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="default-search"
                      class="mb-2 text-sm font-medium"
                    >
                      ID
                    </label>
                    <MathEditor
                      v-bind:model-value="props.details.id"
                      :readonly="true"
                    />
                  </div>
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="content"
                      class="mb-2 text-sm font-medium text-gray-900"
                      v-if="props.details.type === 'regular'"
                    >
                      Content
                    </label>
                    <label
                      for="content"
                      class="mb-2 text-sm font-medium text-gray-900"
                      v-else-if="props.details.type === 'input'"
                    >
                      Spike Train
                    </label>
                    <MathEditor
                      v-bind:model-value="props.details.content"
                      v-if="props.details.type !== 'output'"
                      @change="(value) => (props.details.content = value)"
                    />
                  </div>
                  <div
                    class="relative flex flex-col gap-1"
                    v-if="props.details.type === 'regular'"
                  >
                    <label for="message" class="block mb-2 text-sm font-medium">
                      Rules
                    </label>
                    <MathEditor
                      v-for="(rule, index) in props.details.rules"
                      v-bind:model-value="rule"
                      @change="(value) => (props.details.rules[index] = value)"
                      @delete="props.details.rules.splice(index, 1)"
                    />
                    <button
                      class="py-2 text-sm font-medium border-2 border-dashed rounded-md text-dark/50"
                      @click.prevent="() => props.details.rules.push('')"
                    >
                      Add Rule
                    </button>
                  </div>
                  <button
                    type="submit"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click.prevent="checkDetails"
                  >
                    Update
                  </button>
                </form>
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
import MathEditor from '@/components/MathEditor.vue';
import { useToast } from 'vue-toast-notification';
import {replaceInlineMath} from '@/utils/math';

const props = defineProps(['isOpen', 'closeModal', 'details']);

const $toast = useToast();

const validateNeuron = async (neuron) => {
  const res = await fetch(`${import.meta.env.VITE_HTTP_API}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(neuron),
  });

  const data = await res.json();

  return data;
};

const checkDetails = async () => {
  switch (props.details.type) {
    case 'regular':
      const res = await validateNeuron(props.details);
      $toast.open({
        title: 'Validation results:',
        message: replaceInlineMath(res.message),
        type: res.type,
        position: 'top-right',
      })
      if (res.type === 'error') {
        return;
      }
      break;
    case 'input':
      if (props.details.content === '') {
        $toast.error('Please enter neuron content');
        return;
      }
      break;
    case 'output':
      props.details.content = '';
      break;
    default:
      alert('Invalid neuron type');
      return;
  }

  props.details.success = true;
  props.closeModal();
};
</script>
