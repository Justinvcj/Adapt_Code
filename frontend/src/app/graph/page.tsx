"use client";
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import ConceptGraph from '@/components/adapt/ConceptGraph';

export default function GraphPage() {
  return (
    <>
      <Navbar active="graph" />
      <div className="land">
        <main className="graph-main">
          <header className="graph-head">
            <h1>Concept Map</h1>
            <p>The twelve concepts and how they depend on each other. Hover a node for details, hover a connection to see why it exists.</p>
          </header>
          <ConceptGraph />
        </main>
        <Footer />
      </div>
    </>
  );
}
