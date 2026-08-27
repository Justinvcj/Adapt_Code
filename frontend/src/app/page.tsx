'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

import CardNav from '@/components/reactbits/CardNav';
import SpecularButton from '@/components/reactbits/SpecularButton';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return null; // Will redirect
  }

  const navItems = [
    {
      label: "Features",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        { label: "Adaptive Learning", ariaLabel: "Adaptive", href: "#" },
        { label: "AI Tutor", ariaLabel: "AI Tutor", href: "#" }
      ]
    },
    {
      label: "Community", 
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        { label: "Leaderboard", ariaLabel: "Leaderboard", href: "#" },
        { label: "Discuss", ariaLabel: "Discuss", href: "#" }
      ]
    }
  ];

  return (
    <>
      <CardNav
        logo=""
        logoAlt="</> AdaptCode"
        items={navItems}
        baseColor="rgba(26,26,46,0.85)"
        menuColor="#eff1f6"
        buttonBgColor="#ffa116"
        buttonTextColor="#000"
        ease="power3.out"
      />
      
      <div className="app-wrap" style={{paddingTop: '60px'}}>
        <div className="main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center'}}>
          <h1 style={{fontSize: '56px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            A New Way to Learn
          </h1>
          <p style={{fontSize: '20px', color: 'var(--tx-2)', maxWidth: '650px', marginBottom: '50px', lineHeight: 1.6, fontWeight: 400}}>
            AdaptCode brings you the best coding practice experience with our beautiful dark mode layout, personalized problem recommendations, and an integrated AI Tutor.
          </p>
          
          <div onClick={() => router.push('/register')}>
            <SpecularButton
              size="lg"
              radius={12}
              tint="#ffa116"
              tintOpacity={0.1}
              blur={10}
              textColor="#ffa116"
              lineColor="#ffa116"
              baseColor="#1a1a2e"
              intensity={1.2}
              shineSize={15}
              shineFade={30}
              thickness={2}
              speed={0.5}
              autoAnimate={true}
            >
              Start Coding Now
            </SpecularButton>
          </div>
        </div>
      </div>
    </>
  );
}
