<template>
	<div class="flex flex-center">
		<h3>Simple Component</h3>
		<input type="text" data-test="txt-name" v-model="txtName" />
		<div data-test="result">
			{{ txtName }}
		</div>
	</div>
</template>
  
<script>
import { defineComponent } from 'vue'

export default defineComponent({
	data() {
		return {
			txtName: 'Initial State'
		}
	},
})
</script>
  