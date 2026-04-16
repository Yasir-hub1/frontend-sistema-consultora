/**
 * Utilidad para comprimir imágenes antes de subirlas
 */

/**
 * Comprime una imagen reduciendo su tamaño y calidad
 * @param {File} file - Archivo de imagen a comprimir
 * @param {number} maxWidth - Ancho máximo en píxeles (default: 1920)
 * @param {number} maxHeight - Alto máximo en píxeles (default: 1920)
 * @param {number} quality - Calidad de compresión 0-1 (default: 0.8)
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 2)
 * @returns {Promise<File>} - Archivo comprimido
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8, maxSizeMB = 2) => {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, devolver el archivo original
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    // Si es PDF, devolver el archivo original
    if (file.type === 'application/pdf') {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'))
              return
            }

            // Verificar tamaño final
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > maxSizeMB) {
              // Si aún es muy grande, reducir calidad
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Error al comprimir la imagen'))
                    return
                  }
                  const compressedFile = new File([compressedBlob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                  })
                  resolve(compressedFile)
                },
                file.type,
                Math.max(0.5, quality - 0.2) // Reducir calidad más
              )
            } else {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Formatea el tamaño del archivo para mostrar
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

