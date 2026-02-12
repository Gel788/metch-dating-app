import nodemailer from "nodemailer"

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Metch" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Fallback plain text
      html
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

// Шаблоны email

export const getWelcomeEmailTemplate = (name: string) => {
  return {
    subject: "Добро пожаловать в Metch! ❤️",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Добро пожаловать в Metch!</h1>
          </div>
          <div class="content">
            <p>Привет, ${name}!</p>
            <p>Спасибо за регистрацию на нашей платформе знакомств. Мы рады приветствовать вас!</p>
            <p>Теперь вы можете:</p>
            <ul>
              <li>Просматривать анкеты других пользователей</li>
              <li>Отправлять лайки и сообщения</li>
              <li>Получать Premium функции</li>
              <li>Использовать видео-чат</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}/profiles" class="button">Начать знакомиться</a>
            <p>Если у вас есть вопросы, свяжитесь с нашей поддержкой.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Metch. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const getNewMessageEmailTemplate = (senderName: string, messagePreview: string) => {
  return {
    subject: `${senderName} отправил(а) вам сообщение`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💬 Новое сообщение</h2>
          </div>
          <div class="content">
            <p><strong>${senderName}</strong> отправил(а) вам сообщение:</p>
            <div class="message-box">
              ${messagePreview}
            </div>
            <a href="${process.env.NEXTAUTH_URL}/messages" class="button">Прочитать сообщение</a>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const getNewLikeEmailTemplate = (likerName: string) => {
  return {
    subject: `❤️ ${likerName} лайкнул ваш профиль!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .heart { font-size: 60px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>У вас новый лайк!</h2>
          </div>
          <div class="content">
            <div class="heart">❤️</div>
            <p><strong>${likerName}</strong> лайкнул(а) ваш профиль!</p>
            <p>Возможно, вы понравились друг другу?</p>
            <a href="${process.env.NEXTAUTH_URL}/likes" class="button">Посмотреть профиль</a>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const getMatchEmailTemplate = (matchName: string) => {
  return {
    subject: `🎉 У вас Match с ${matchName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .celebration { font-size: 80px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Это Match!</h1>
          </div>
          <div class="content">
            <div class="celebration">🎉💖🎉</div>
            <p>Поздравляем! У вас взаимная симпатия с <strong>${matchName}</strong>!</p>
            <p>Теперь вы можете начать общение и узнать друг друга лучше.</p>
            <a href="${process.env.NEXTAUTH_URL}/messages" class="button">Написать сообщение</a>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const getPremiumActivatedEmailTemplate = (name: string, plan: string, endDate: string) => {
  return {
    subject: "💎 Premium подписка активирована!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .premium-icon { font-size: 60px; text-align: center; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .feature { margin: 10px 0; padding-left: 30px; position: relative; }
          .feature:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Premium подписка активирована!</h1>
          </div>
          <div class="content">
            <div class="premium-icon">💎</div>
            <p>Привет, ${name}!</p>
            <p>Ваша <strong>${plan}</strong> подписка успешно активирована до ${endDate}.</p>
            <div class="features">
              <h3>Теперь вам доступны:</h3>
              <div class="feature">Безлимитные сообщения</div>
              <div class="feature">Режим инкогнито</div>
              <div class="feature">Размещение в топе</div>
              <div class="feature">Виртуальные подарки</div>
              <div class="feature">Видео-чат</div>
              <div class="feature">Приоритетная проверка</div>
            </div>
            <p>Желаем удачных знакомств!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
