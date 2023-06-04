<template>
  <div
    id="simulationControls"
    class="absolute left-0 right-0 flex flex-col items-center justify-center px-8 py-4 mx-auto border rounded-xl w-fit bottom-4 bg-light/40 border-dark/5 dark:border-light/5 dark:bg-neutral/40 backdrop-blur-sm"
  >
    <div class="flex items-center gap-2 text-dark/50 dark:text-dark-50">
      <Popper class="tooltip" hover placement="top">
        <template #content>
          {{
            system.mode.charAt(0).toUpperCase() + system.mode.slice(1) + ' Mode'
          }}
        </template>
        <button
          class="toggle"
          @click="
            () =>
              (system.mode =
                system.mode === 'pseudorandom' ? 'guided' : 'pseudorandom')
          "
          :class="
            system.mode === 'pseudorandom'
              ? `after:content-['']`
              : `after:content-none`
          "
        >
          <v-icon
            name="la-random-solid"
            :class="system.mode === 'pseudorandom' ? 'active-toggle' : ''"
          />
        </button>
      </Popper>
      <v-icon
        name="la-step-backward-solid"
        @click="prev"
        scale="1.25"
        class="cursor-pointer"
      />
      <button
        class="p-1 rounded-full text-light bg-primary dark:bg-primary/20 dark:text-primary"
      >
        <v-icon
          name="bi-play-fill"
          @click="play"
          v-if="!navbar.running"
          scale="2"
          class="translate-x-[0.1rem]"
        />
        <v-icon name="bi-stop-fill" v-else scale="2" @click="stop" />
      </button>
      <v-icon
        name="la-step-forward-solid"
        @click="next"
        scale="1.25"
        class="cursor-pointer"
      />
      <Popper class="tooltip" hover placement="top">
        <template #content> Reset </template>
        <v-icon
          name="la-sync-solid"
          class="ml-2 cursor-pointer"
          @click="$emit('reset')"
        />
      </Popper>
    </div>
    <div class="flex flex-col items-center justify-center gap-1">
      <input
        id="default-range"
        type="range"
        min="0.25"
        max="2.75"
        step="0.25"
        :value="system.speed"
        @input="(e) => (system.speed = e.target.value)"
        class="mt-4 slider"
      />
      <div>
        <span class="text-xs text-dark/40 dark:text-light/40"
          >{{ system.speed }}x</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import navbar from '@/stores/navbar';
import system from '@/stores/system';

const stop = () => {
  navbar.running = false;
  system.ws.send(JSON.stringify({ cmd: 'stop' }));
};

const play = async () => {
  navbar.running = true;
  if (!system.reset) {
    system.ws = new WebSocket(
      `${import.meta.env.VITE_WS_API}/ws/simulate/${system.mode}`
    );
    system.reset = system.data();
  } else {
    system.ws.send(JSON.stringify({ cmd: 'continue' }));
  }
};

const next = async () => {
  system.ws.send(JSON.stringify({ cmd: 'next' }));
};

const prev = async () => {
  system.ws.send(JSON.stringify({ cmd: 'prev' }));
};
</script>
