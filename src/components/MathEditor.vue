<template>
  <div class="relative math">
    <div ref="mathField" />
    <v-icon
      name="bi-dash-circle"
      @click="props.onDelete"
      class="absolute top-0 bottom-0 my-auto cursor-pointer right-3 text-dark/40"
      v-if="props.onDelete"
    />
  </div>
</template>

<style scoped>
.mq-editable-field {
  width: 100%;
  height: 100%;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import MathQuill from 'mathquill-node';
import 'mathquill-node/lib/mathquill.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  onChange: {
    type: Function,
    required: true,
  },
  onDelete: {
    type: Function,
    required: false,
  },
});

const specialKeys = {
  '/': '\\slash',
  '*': '\\ast',
};

const mathField = ref(null);

onMounted(() => {
  const MQ = MathQuill.getInterface(2);
  const mathQuillElement = mathField.value;

  const mathFieldInstance = MQ.MathField(mathQuillElement, {
    handlers: {
      edit: () => {
        props.onChange(mathFieldInstance.latex());
      },
    },
    autoCommands: 'slash to rightarrow lambda ast',
  });

  mathFieldInstance.el().addEventListener('keydown', function (e) {
    if (e.key in specialKeys) {
      mathFieldInstance.cmd(specialKeys[e.key]);
      e.preventDefault();
    }
  });

  mathFieldInstance.latex(props.modelValue);
});
</script>
