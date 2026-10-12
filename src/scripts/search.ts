import { mount } from 'svelte'
import SearchModal from '../components/SearchModal.svelte'

const target = document.getElementById('search-root')
if (target) mount(SearchModal, { target })
