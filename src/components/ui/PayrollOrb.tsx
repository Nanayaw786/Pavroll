'use client'
import { useEffect, useRef } from 'react'

export default function PayrollOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    let frame = 0
    let animId: number

    const projectPoint = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 280
      const scale = fov / (fov + z)
      return { x: cx + x * scale, y: cy + y * scale, scale }
    }

    const rotateY = (x: number, y: number, z: number, angle: number) => ({
      x: x * Math.cos(angle) + z * Math.sin(angle),
      y,
      z: -x * Math.sin(angle) + z * Math.cos(angle),
    })

    const rotateX = (x: number, y: number, z: number, angle: number) => ({
      x,
      y: y * Math.cos(angle) - z * Math.sin(angle),
      z: y * Math.sin(angle) + z * Math.cos(angle),
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      frame += 0.008

      const radius = 75
      const latLines = 10
      const lngLines = 12
      const pointsPerLine = 48

      // Ambient glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + 20)
      glow.addColorStop(0, 'rgba(99,102,241,0.12)')
      glow.addColorStop(0.6, 'rgba(99,102,241,0.05)')
      glow.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Draw latitude lines
      for (let i = 1; i < latLines; i++) {
        const phi = (i / latLines) * Math.PI
        const points: { x: number; y: number; z: number }[] = []
        for (let j = 0; j <= pointsPerLine; j++) {
          const theta = (j / pointsPerLine) * Math.PI * 2
          let p = {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta),
          }
          p = rotateY(p.x, p.y, p.z, frame)
          p = rotateX(p.x, p.y, p.z, frame * 0.4)
          points.push(p)
        }
        ctx.beginPath()
        points.forEach((p, idx) => {
          const proj = projectPoint(p.x, p.y, p.z, cx, cy)
          const alpha = (p.z + radius) / (2 * radius)
          ctx.strokeStyle = `rgba(99,102,241,${0.08 + alpha * 0.35})`
          ctx.lineWidth = 0.6
          if (idx === 0) ctx.moveTo(proj.x, proj.y)
          else ctx.lineTo(proj.x, proj.y)
        })
        ctx.stroke()
      }

      // Draw longitude lines
      for (let i = 0; i < lngLines; i++) {
        const theta = (i / lngLines) * Math.PI * 2
        const points: { x: number; y: number; z: number }[] = []
        for (let j = 0; j <= pointsPerLine; j++) {
          const phi = (j / pointsPerLine) * Math.PI
          let p = {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta),
          }
          p = rotateY(p.x, p.y, p.z, frame)
          p = rotateX(p.x, p.y, p.z, frame * 0.4)
          points.push(p)
        }
        ctx.beginPath()
        points.forEach((p, idx) => {
          const proj = projectPoint(p.x, p.y, p.z, cx, cy)
          const alpha = (p.z + radius) / (2 * radius)
          ctx.strokeStyle = `rgba(129,140,248,${0.06 + alpha * 0.3})`
          ctx.lineWidth = 0.6
          if (idx === 0) ctx.moveTo(proj.x, proj.y)
          else ctx.lineTo(proj.x, proj.y)
        })
        ctx.stroke()
      }

      // Glowing dots at intersections
      for (let i = 1; i < latLines; i++) {
        for (let j = 0; j < lngLines; j++) {
          const phi = (i / latLines) * Math.PI
          const theta = (j / lngLines) * Math.PI * 2
          let p = {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta),
          }
          p = rotateY(p.x, p.y, p.z, frame)
          p = rotateX(p.x, p.y, p.z, frame * 0.4)
          const proj = projectPoint(p.x, p.y, p.z, cx, cy)
          const alpha = (p.z + radius) / (2 * radius)
          if (alpha > 0.5) {
            ctx.beginPath()
            ctx.arc(proj.x, proj.y, 1.5 * proj.scale, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(165,180,252,${alpha * 0.8})`
            ctx.fill()
          }
        }
      }

      // Core inner glow
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
      coreGlow.addColorStop(0, 'rgba(129,140,248,0.15)')
      coreGlow.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fillStyle = coreGlow
      ctx.fill()

      // Pulse ring
      const pulse = Math.sin(frame * 2.5) * 0.5 + 0.5
      ctx.beginPath()
      ctx.arc(cx, cy, radius + 8 + pulse * 10, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - pulse)})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      animId = requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
