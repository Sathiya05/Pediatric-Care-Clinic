/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './*.html',
    './dashboard/*.html',
    './js/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#287C91',
          'primary-dark': '#1F5F70',
          'primary-light': '#3E93A8',
          secondary: '#F4A261',
          'secondary-dark': '#E08A45',
          accent: '#DDF3EF',
          bg: '#FFF9F4',
          card: '#FFFFFF',
          peach: '#FFF3E8',
          border: '#E5E7EB',
          text: '#334155',
          'text-secondary': '#64748B',
          darkbg: '#132B35',
          darksurface: '#1C3B47',
          darktext: '#F8FAFC',
          darktext2: '#CBD5E1'
        }
      },
      fontFamily: {
        logo: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(40, 124, 145, 0.25)',
        card: '0 6px 20px -8px rgba(51, 65, 85, 0.18)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      screens: {
        // Tablet / small-laptop range (e.g. 768x1024, 1024x768, 1376x1032)
        // collapses the navbar into the hamburger; full nav only at >= 1377px.
        wide: '1377px'
      }
    }
  },
  plugins: []
};
