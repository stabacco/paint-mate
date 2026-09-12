import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    background:
      radial-gradient(1200px 500px at 10% -10%, rgba(201, 162, 39, 0.14), transparent 55%),
      radial-gradient(900px 420px at 110% 0%, rgba(156, 59, 40, 0.1), transparent 50%),
      ${({ theme }) => theme.paper};
    color: ${({ theme }) => theme.ink};
    font-family: ${({ theme }) => theme.fontBody};
    line-height: 1.45;
    -webkit-text-size-adjust: 100%;
  }

  button,
  input,
  textarea {
    font: inherit;
    touch-action: manipulation;
  }

  button {
    cursor: pointer;
  }

  img {
    max-width: 100%;
    display: block;
  }
`
