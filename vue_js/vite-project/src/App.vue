<template>
  <div>
    <h1>{{ product }}</h1>
    <p>{{ description }}</p>

    <!-- Event listeners -->
    <p>Cart: {{ cart }}</p>

    <button class="button" @click="addToCart">
      Add to Cart
    </button>
    <button class="button" @click="removeFromCart" :disabled="cart === 0" :class="{ disabledButton: cart === 0 }">
      Remove from Cart
    </button>
    <button @click="resetCart">Reset Cart</button>


    <div v-for="variant in variants" :key="variant.id" @mouseover="updateImage(variant.image)">
      {{ variant.color }}
    </div>

    <!-- if in stock -->
    <!-- <p v-if="inStock">In Stock</p>
    <p v-else>Out of Stock</p> -->
    <p v-if="inventory > 10">In Stock</p>
    <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
    <p v-else>Out of Stock</p>

    <!-- images -->
    <div class="product-image">
      <img :src="image" :alt="product" width="250" />
    </div>
    <a class="link" :href="url" target="_blank" rel="noopener">
      Open product link
      <svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M13 5l7 7-7 7M20 12H4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </a>
    <p></p>
    <button @click="switchToBlue()">Switch to Blue Socks</button>
    <button @click="switchToGreen()">Switch to Green Socks</button>

    <!-- Product Details -->
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
    <h3>Variant Colors</h3>
    <ul>
      <li v-for="variant in variants" :key="variant.id">
        {{ variant.color }}
      </li>
    </ul>
    <ul>
      <li v-for="size in sizes" :key="size">{{ size }}</li>
    </ul>

    <!-- Style binding -->
    <div v-for="variant in variants" :key="variant.id" class="color-circle" @mouseover="updateImage(variant.image)"
      :style="{ backgroundColor: variant.color }">
    </div>
    <!-- <button class="button" :class="{ disabledButton: !inStock }" :disabled="!inStock" @click="addToCart">
      Add to Cart
    </button> -->

    <!-- multiple classes -->
    <div class="color-circle active"></div>
    <div :class="isActive ? activeClass : ''"></div>
    <img :src="image" :class="{ 'out-of-stock-img': !inStock }"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import socksGreen from './assets/images/socks_green.jpg'
import socksBlue from './assets/images/socks_blue.jpg'

const product = ref('Socks')
const description = ref('Warm, comfortable socks for everyday wear.')
const url = ref('https://www.nike.com')
const image = ref(socksGreen)
const inStock = ref(true)
const inventory = ref(100)
const details = ref(['50% cotton', '30% wool', '20% polyester'])
const variants = ref([
  { id: 2234, color: 'green', image: socksGreen },
  { id: 2235, color: 'blue', image: socksBlue }
])
const sizes = ref(['S', 'M', 'L', 'XL'])
const cart = ref(0)

function resetCart() {
  cart.value = 0;
}
function removeFromCart() {
  if (cart.value > 0) { cart.value -= 1 }
  else { cart.value = 0 }
}
function updateImage(variantImage) {
  image.value = variantImage
}
function addToCart() {
  cart.value += 1
}
function switchToBlue() {
  image.value = socksBlue
}
function switchToGreen() {
  image.value = socksGreen
}
</script>

<style scoped>
.link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0b63ce;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.arrow-icon {
  width: 18px;
  height: 18px;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: inline-block;
  margin: 6px 10px 6px 0;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.color-circle:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  border-color: #0b63ce;
}
</style>
