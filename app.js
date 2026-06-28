const fs = require('fs')
const path = require('path')

// Archivo donde se guardan los temporizadores
const archivoGuardados = path.join(__dirname, 'guardados.json')

// Cargar guardados del archivo
function cargarGuardados() {
  try {
    if (fs.existsSync(archivoGuardados)) {
      const contenido = fs.readFileSync(archivoGuardados, 'utf8')
      return JSON.parse(contenido)
    }
  } catch (e) {
    console.error('Error leyendo guardados:', e)
  }
  return []
}

// Guardar en archivo
function guardarEnArchivo(lista) {
  try {
    fs.writeFileSync(archivoGuardados, JSON.stringify(lista, null, 2))
  } catch (e) {
    console.error('Error guardando archivo:', e)
  }
}

let listaGuardados = cargarGuardados()

// ==================
// NAVEGACIÓN
// ==================
function mostrar(seccion) {
  document.getElementById('menu').classList.add('oculto')
  document.getElementById('reloj').classList.add('oculto')
  document.getElementById('cronometro').classList.add('oculto')
  document.getElementById('temporizador').classList.add('oculto')
  const el = document.getElementById(seccion)
  if (el) el.classList.remove('oculto')
}

function volver() {
  document.getElementById('menu').classList.remove('oculto')
  document.getElementById('reloj').classList.add('oculto')
  document.getElementById('cronometro').classList.add('oculto')
  document.getElementById('temporizador').classList.add('oculto')
  resetearCronometro()
  resetearTemporizador()
}

// ==================
// RELOJ
// ==================
function actualizarReloj() {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  const segundos = String(ahora.getSeconds()).padStart(2, '0')
  const el = document.getElementById('reloj-display')
  if (el) el.textContent = `${horas}:${minutos}:${segundos}`
}

// ==================
// CRONÓMETRO
// ==================
let cronometroSegundos = 0
let cronometroInterval = null

function iniciarCronometro() {
  if (cronometroInterval) return
  cronometroInterval = setInterval(() => {
    cronometroSegundos++
    const h = String(Math.floor(cronometroSegundos / 3600)).padStart(2, '0')
    const m = String(Math.floor((cronometroSegundos % 3600) / 60)).padStart(2, '0')
    const s = String(cronometroSegundos % 60).padStart(2, '0')
    const el = document.getElementById('cronometro-display')
    if (el) el.textContent = `${h}:${m}:${s}`
  }, 1000)
}

function pausarCronometro() {
  clearInterval(cronometroInterval)
  cronometroInterval = null
}

function resetearCronometro() {
  pausarCronometro()
  cronometroSegundos = 0
  const el = document.getElementById('cronometro-display')
  if (el) el.textContent = '00:00:00'
}

// ==================
// TEMPORIZADOR
// ==================
let temporizadorSegundos = 0
let temporizadorInterval = null
let temporizadorCorriendo = false
let tiempoInicial = 0
let listaReproduccion = []
let indiceReproduccion = -1

function ajustarTiempo(id, cantidad) {
  const el = document.getElementById(id)
  if (!el) return
  const maximo = id === 'temp-m' ? 99 : 59
  let valor = parseInt(el.textContent) || 0
  valor += cantidad
  if (valor < 0) valor = 0
  if (valor > maximo) valor = maximo
  el.textContent = String(valor).padStart(2, '0')
}

function validarParte(id, maximo) {
  const el = document.getElementById(id)
  if (!el) return
  let valor = parseInt(el.textContent) || 0
  if (valor < 0) valor = 0
  if (valor > maximo) valor = maximo
  el.textContent = String(valor).padStart(2, '0')
}

function iniciarTemporizador() {
  if (temporizadorInterval) return

  if (temporizadorSegundos === 0) {
    const minutos = parseInt(document.getElementById('temp-m').textContent) || 0
    const segundos = parseInt(document.getElementById('temp-s').textContent) || 0
    temporizadorSegundos = (minutos * 60) + segundos
    tiempoInicial = temporizadorSegundos
  }

  if (temporizadorSegundos <= 0) return

  const sidebar = document.getElementById('sidebar')
  const config = document.getElementById('temp-config')
  const corriendo = document.getElementById('temp-corriendo')
  if (sidebar) sidebar.classList.add('oculto')
  if (config) config.classList.add('oculto')
  if (corriendo) corriendo.classList.remove('oculto')
  temporizadorCorriendo = true

  const display = document.getElementById('temp-display-grande')
  if (display) {
    const mInicial = String(Math.floor(temporizadorSegundos / 60)).padStart(2, '0')
    const sInicial = String(temporizadorSegundos % 60).padStart(2, '0')
    display.textContent = `${mInicial}:${sInicial}`
    display.classList.remove('critico')
  }

  temporizadorInterval = setInterval(() => {
    temporizadorSegundos--
    if (temporizadorSegundos < 0) temporizadorSegundos = 0
    const m = String(Math.floor(temporizadorSegundos / 60)).padStart(2, '0')
    const s = String(temporizadorSegundos % 60).padStart(2, '0')
    if (display) display.textContent = `${m}:${s}`

    if (tiempoInicial > 0 && temporizadorSegundos <= Math.ceil(tiempoInicial * 0.1)) {
      if (display) display.classList.add('critico')
    } else {
      if (display) display.classList.remove('critico')
    }

    if (temporizadorSegundos <= 0) {
      clearInterval(temporizadorInterval)
      temporizadorInterval = null
      temporizadorCorriendo = false

      //NUEVO: avanzar al siguiente en la lista de reproducción
      if (indiceReproduccion >= 0) {
        indiceReproduccion++
        if (indiceReproduccion < listaGuardados.length) {
          setTimeout(() => {
            cargarGuardado(indiceReproduccion)
            iniciarTemporizador()
          }, 1000)
        } else {
          indiceReproduccion = -1 // fin de la lista
          if (display) {
            display.textContent = 'Se acabó el tiempo'
            display.classList.remove('critico')
          }
        }
      } else {
        if (display) {
          display.textContent = 'Se acabó el tiempo'
          display.classList.remove('critico')
        }
      }
    }
  }, 1000)
}

function pausarTemporizador() {
  clearInterval(temporizadorInterval)
  temporizadorInterval = null
}

function reanudarTemporizador() {
  if (temporizadorInterval || temporizadorSegundos <= 0) return
  const display = document.getElementById('temp-display-grande')
  temporizadorInterval = setInterval(() => {
    temporizadorSegundos--
    if (temporizadorSegundos < 0) temporizadorSegundos = 0
    const m = String(Math.floor(temporizadorSegundos / 60)).padStart(2, '0')
    const s = String(temporizadorSegundos % 60).padStart(2, '0')
    if (display) display.textContent = `${m}:${s}`

    if (tiempoInicial > 0 && temporizadorSegundos <= Math.ceil(tiempoInicial * 0.1)) {
      if (display) display.classList.add('critico')
    } else {
      if (display) display.classList.remove('critico')
    }

    if (temporizadorSegundos <= 0) {
      clearInterval(temporizadorInterval)
      temporizadorInterval = null
      temporizadorCorriendo = false
      if (display) {
        display.textContent = 'Se acabo el tiempo!'
        display.classList.remove('critico')
      }

      //NUEVO: avanzar al siguiente en la lista de reproducción
      if (indiceReproduccion >= 0) {
        indiceReproduccion++
        if (indiceReproduccion < listaGuardados.length) {
          cargarGuardado(indiceReproduccion)
          iniciarTemporizador()
        } else {
          indiceReproduccion = -1 // fin de la lista
        }
      }
    }
  }, 1000)
}


function resetearTemporizador() {
  pausarTemporizador()
  temporizadorSegundos = 0
  temporizadorCorriendo = false
  tiempoInicial = 0
  const display = document.getElementById('temp-display-grande')
  if (display) {
    display.textContent = '00:00'
    display.classList.remove('critico')
  }
  const sidebar = document.getElementById('sidebar')
  const config = document.getElementById('temp-config')
  const corriendo = document.getElementById('temp-corriendo')
  if (sidebar) sidebar.classList.remove('oculto')
  if (config) config.classList.remove('oculto')
  if (corriendo) corriendo.classList.add('oculto')
  const mEl = document.getElementById('temp-m')
  const sEl = document.getElementById('temp-s')
  if (mEl) mEl.textContent = '00'
  if (sEl) sEl.textContent = '00'
}

// ==================
// GUARDADOS
// ==================
function agregarTemporizador() {
  const minutos = parseInt(document.getElementById('temp-m').textContent) || 0
  const segundos = parseInt(document.getElementById('temp-s').textContent) || 0
  const totalSegundos = (minutos * 60) + segundos

  if (totalSegundos <= 0) return

  listaGuardados.push({
    nombre: 'Nuevo temporizador',
    segundos: totalSegundos
  })

  guardarEnArchivo(listaGuardados)
  renderizarGuardados()
}

function renderizarGuardados() {
  const lista = document.getElementById('lista-guardados')
  if (!lista) return
  lista.innerHTML = ''

  listaGuardados.forEach((item, index) => {
    const m = String(Math.floor(item.segundos / 60)).padStart(2, '0')
    const s = String(item.segundos % 60).padStart(2, '0')

    const div = document.createElement('div')
    div.className = 'item-guardado'
    div.setAttribute('draggable', 'true')
    div.dataset.index = index
    div.innerHTML = `
      <div class="item-header">
        <div class="drag-handle" draggable="true">☰</div>
        <div class="item-tiempo">${m}:${s}</div>
        <div class="item-actions">
          <button class="item-borrar" onclick="borrarGuardado(${index})">✕</button>
        </div>
      </div>
      <div class="item-nombre" contenteditable="true" 
          onblur="renombrarGuardado(${index}, this)">${item.nombre}</div>
    `

    
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('item-borrar')) return
      if (e.target.classList.contains('item-nombre')) return
      if (e.target.classList.contains('drag-handle')) return
      cargarGuardado(index)
    })

    const handle = div.querySelector('.drag-handle')
    handle.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index)
    })

    div.addEventListener('dragover', (e) => {
      e.preventDefault()
      div.classList.add('drag-over')
    })

    div.addEventListener('dragleave', () => {
      div.classList.remove('drag-over')
    })

    div.addEventListener('drop', (e) => {
      e.preventDefault()
      div.classList.remove('drag-over')
      const origen = parseInt(e.dataTransfer.getData('text/plain'))
      const destino = index

      if (origen !== destino) {
        const item = listaGuardados.splice(origen, 1)[0]
        listaGuardados.splice(destino, 0, item)
        guardarEnArchivo(listaGuardados)
        renderizarGuardados()
      }
    })

    lista.appendChild(div)
  })
}



function borrarGuardado(index) {
  if (index < 0 || index >= listaGuardados.length) return
  listaGuardados.splice(index, 1)
  guardarEnArchivo(listaGuardados)
  renderizarGuardados()
}

function renombrarGuardado(index, el) {
  const nuevoNombre = el.textContent.trim()
  if (nuevoNombre === '') {
    el.textContent = listaGuardados[index].nombre
    return
  }
  listaGuardados[index].nombre = nuevoNombre
  guardarEnArchivo(listaGuardados)
}

function toggleEnReproduccion(index, checkbox) {
  if (checkbox.checked) {
    if (!listaReproduccion.includes(index)) listaReproduccion.push(index)
  } else {
    listaReproduccion = listaReproduccion.filter(i => i !== index)
  }
}

function iniciarLista() {
  if (listaGuardados.length === 0) return
  indiceReproduccion = 0
  cargarGuardado(indiceReproduccion)
  iniciarTemporizador()
}


function cargarGuardado(index) {
  const item = listaGuardados[index]
  if (!item) return
  const m = String(Math.floor(item.segundos / 60)).padStart(2, '0')
  const s = String(item.segundos % 60).padStart(2, '0')
  const mEl = document.getElementById('temp-m')
  const sEl = document.getElementById('temp-s')
  if (mEl) mEl.textContent = m
  if (sEl) sEl.textContent = s
  temporizadorSegundos = item.segundos
  tiempoInicial = item.segundos
}

// ==================
// TECLADO Y EVENTOS GLOBALES
// ==================
document.addEventListener('keydown', (e) => {
  const tempVisible = document.getElementById('temporizador') && !document.getElementById('temporizador').classList.contains('oculto')
  const enModoCorriendo = document.getElementById('temp-corriendo') && !document.getElementById('temp-corriendo').classList.contains('oculto')

  if (tempVisible && enModoCorriendo) {
    if (e.code === 'Space') {
      e.preventDefault()
      if (temporizadorInterval) {
        pausarTemporizador()
      } else {
        reanudarTemporizador()
      }
    }

    if (e.code === 'KeyR') {
      resetearTemporizador()
    }
  }

  if (e.code === 'Escape') {
    volver()
  }
})

// ==================
// CORRECCIÓN DE CAMPOS EDITABLES Y ARRANQUE
// ==================
document.addEventListener('DOMContentLoaded', () => {
  // Reloj
  actualizarReloj()
  setInterval(actualizarReloj, 1000)

  // Renderizar guardados (si existe el contenedor)
  renderizarGuardados()

  // Comportamiento de campos editable (temp-m, temp-s)
  document.querySelectorAll('.tiempo-parte').forEach(el => {
    el.addEventListener('focus', function() {
      if (this.textContent === '00') {
        this.textContent = ''
      }
      setTimeout(() => {
        const range = document.createRange()
        range.selectNodeContents(this)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
      }, 10)
    })

    el.addEventListener('blur', function() {
      if (this.textContent.trim() === '') {
        this.textContent = '00'
      } else {
        // Asegurar formato con dos dígitos y límites
        const id = this.id
        const maximo = id === 'temp-m' ? 99 : 59
        let valor = parseInt(this.textContent) || 0
        if (valor < 0) valor = 0
        if (valor > maximo) valor = maximo
        this.textContent = String(valor).padStart(2, '0')
      }
    })

    // Evitar que Enter inserte salto de línea
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.blur()
      }
    })
  })
})

function mostrarChangelog() {
  const modal = document.getElementById('changelog-modal')
  if (modal) modal.classList.remove('oculto')
}

function cerrarChangelog() {
  const modal = document.getElementById('changelog-modal')
  if (modal) modal.classList.add('oculto')
  // Guardar que ya se mostró esta versión
  localStorage.setItem('changelog_v110', 'true')
}

// Mostrar solo la primera vez
window.addEventListener('DOMContentLoaded', () => {
  const visto = localStorage.getItem('changelog_v111')
  if (!visto) {
    mostrarChangelog()
  }
})
