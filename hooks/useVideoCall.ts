"use client"

import { useEffect, useRef, useState } from "react"
import { useSocket } from "./useSocket"

interface UseVideoCallProps {
  userId?: string
  recipientId?: string
  onCallEnded?: () => void
}

export const useVideoCall = ({ userId, recipientId, onCallEnded }: UseVideoCallProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "ringing" | "connected" | "ended">("idle")

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const { socket } = useSocket(userId)

  // ICE серверы для WebRTC
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ]
  }

  // Инициализация peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers)

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && recipientId) {
        socket.emit("ice_candidate", {
          candidate: event.candidate,
          to: recipientId
        })
      }
    }

    pc.ontrack = (event) => {
      console.log("Received remote stream")
      setRemoteStream(event.streams[0])
    }

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState)
      if (pc.connectionState === "connected") {
        setCallStatus("connected")
        setIsConnecting(false)
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall()
      }
    }

    return pc
  }

  // Начало звонка
  const startCall = async () => {
    if (!recipientId || !socket) {
      console.error("Missing recipientId or socket")
      return
    }

    try {
      setIsConnecting(true)
      setCallStatus("calling")

      // Получаем локальный стрим
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })

      setLocalStream(stream)

      // Создаем peer connection
      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      // Добавляем локальный стрим
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Создаем offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Отправляем offer получателю
      socket.emit("call_offer", {
        offer,
        to: recipientId,
        from: userId
      })

      setIsCallActive(true)
    } catch (error) {
      console.error("Error starting call:", error)
      setIsConnecting(false)
      setCallStatus("idle")
      alert("Не удалось получить доступ к камере/микрофону")
    }
  }

  // Ответ на звонок
  const answerCall = async (offer: RTCSessionDescriptionInit, callerId: string) => {
    try {
      setIsConnecting(true)
      setCallStatus("ringing")

      // Получаем локальный стрим
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })

      setLocalStream(stream)

      // Создаем peer connection
      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      // Добавляем локальный стрим
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Устанавливаем remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      // Создаем answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      // Отправляем answer звонящему
      if (socket) {
        socket.emit("call_answer", {
          answer,
          to: callerId
        })
      }

      setIsCallActive(true)
    } catch (error) {
      console.error("Error answering call:", error)
      setIsConnecting(false)
      setCallStatus("idle")
    }
  }

  // Завершение звонка
  const endCall = () => {
    // Останавливаем все треки
    localStream?.getTracks().forEach(track => track.stop())
    remoteStream?.getTracks().forEach(track => track.stop())

    // Закрываем peer connection
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null

    // Уведомляем другого пользователя
    if (socket && recipientId) {
      socket.emit("call_ended", { to: recipientId })
    }

    // Сбрасываем состояние
    setLocalStream(null)
    setRemoteStream(null)
    setIsCallActive(false)
    setIsConnecting(false)
    setCallStatus("ended")

    // Callback
    onCallEnded?.()
  }

  // Переключение микрофона
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Переключение видео
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  // Слушаем WebRTC события через Socket.io
  useEffect(() => {
    if (!socket) return

    socket.on("call_offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log("Received call offer from:", from)
      const accept = window.confirm(`Входящий звонок от ${from}. Принять?`)
      
      if (accept) {
        await answerCall(offer, from)
      } else {
        socket.emit("call_rejected", { to: from })
      }
    })

    socket.on("call_answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log("Received call answer")
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on("ice_candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      console.log("Received ICE candidate")
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on("call_ended", () => {
      console.log("Call ended by remote peer")
      endCall()
    })

    socket.on("call_rejected", () => {
      console.log("Call rejected")
      alert("Звонок отклонен")
      endCall()
    })

    return () => {
      socket.off("call_offer")
      socket.off("call_answer")
      socket.off("ice_candidate")
      socket.off("call_ended")
      socket.off("call_rejected")
    }
  }, [socket, recipientId])

  return {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    isMuted,
    isVideoOff,
    callStatus,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  }
}
