<template>
      <!-- HERO (Asymmetric Premium Layout) -->
<section id="home" class="pt-40 pb-24 max-w-6xl mx-auto px-6 bg-transparent">
    <div class="grid lg:grid-cols-12 gap-16 items-start">
      <!-- Left Sticky Column: Value Prop -->
      <div class="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-slate-900">
          Manage projects with clarity and simplicity
        </h1>
        <p class="text-slate-600 text-lg leading-relaxed max-w-xl">
          TaskFlow is a modern project management platform designed for teams who want structure without complexity. Plan, track, and deliver work in one clean workspace.
        </p>
        <div class="flex flex-row space-x-4">
          <a href="#pricing" class="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition shadow-sm">
            Get Started
          </a>
          <a href="#about" class="px-6 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-700 transition">
            Learn More
          </a>
        </div>
      </div>

      <!-- Right Column: Flowing Workflow Preview -->
      <div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div class="mb-10">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Workflow Preview
          </div>
          <h3 class="text-2xl font-semibold mt-2 text-slate-900">
            A simple flow from idea to delivery
          </h3>
        </div>
        
        <!-- Timeline Flow UI -->
        <div class="relative pl-8 space-y-12 before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
          <!-- Step 1 -->
          <div class="relative">
            <div class="absolute -left-7.75 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-4 border-white shadow-sm flex items-center justify-center"></div>
            <h4 class="text-lg font-semibold text-slate-900">Plan</h4>
            <p class="text-slate-600 text-sm mt-1 leading-relaxed">
              Define goals, create tasks, and break work into structured milestones.
            </p>
          </div>
          <!-- Step 2 -->
          <div class="relative">
            <div class="absolute -left-7.75 top-1.5 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center"></div>
            <h4 class="text-lg font-semibold text-slate-900">Track</h4>
            <p class="text-slate-600 text-sm mt-1 leading-relaxed">
              Monitor progress in real time with full visibility across teams and tasks.
            </p>
          </div>
          <!-- Step 3 -->
          <div class="relative">
            <div class="absolute -left-7.75 top-1.5 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center"></div>
            <h4 class="text-lg font-semibold text-slate-900">Deliver</h4>
            <p class="text-slate-600 text-sm mt-1 leading-relaxed">
              Ship work faster with fewer blockers and clear completion tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

</template>