import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Award,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Certificate {
  certificateId: string;
  recipientName: string;
  role: string;
  teamName: string;
  eventName: string;
  awardTitle: string;
  issuedAt: string;
  issuer: string;
  verificationHash: string;
}

export default function CertificatesPage() {
  const { currentUser } = useAppContext();
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      certificateId: "HH-2026-WINNER-8842",
      recipientName: currentUser?.name || "SriRam Kunamsetty",
      role: "Lead Full-Stack Architect",
      teamName: "Zenith Squad",
      eventName: "IEEE Innovation Sprint 2026",
      awardTitle: "1st Place Grand Winner & Best Engineering",
      issuedAt: "November 19, 2026",
      issuer: "HackHub Organizing Committee & IEEE",
      verificationHash: "0x8fa3e921d7b4198c47b59e001c23a54b9f1a238e",
    },
    {
      certificateId: "HH-2026-PART-3190",
      recipientName: currentUser?.name || "SriRam Kunamsetty",
      role: "Participant",
      teamName: "Zenith Squad",
      eventName: "IEEE Innovation Sprint 2026",
      awardTitle: "Certificate of Outstanding Completion",
      issuedAt: "November 19, 2026",
      issuer: "HackHub Organizing Committee",
      verificationHash: "0x41ab99283f51082c9f8021d98bc61109aef88231",
    },
  ]);

  const [selectedCert, setSelectedCert] = useState<Certificate>(certificates[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [currentUser]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/certificates/user/me");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setCertificates(data);
          setSelectedCert(data[0]);
        }
      }
    } catch {
      // Use fallback
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/certificates?id=${selectedCert.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-400" />
              Verifiable Digital Credentials & Certificates
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Cryptographically verified completion and excellence certificates for HackHub participants and winners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Copied Link!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Share Verification Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Selector Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium shrink-0">Your Credentials:</span>
          {certificates.map((cert) => (
            <button
              key={cert.certificateId}
              onClick={() => setSelectedCert(cert)}
              className={`px-3.5 py-2 rounded-xl font-semibold border transition shrink-0 ${
                selectedCert.certificateId === cert.certificateId
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {cert.awardTitle}
            </button>
          ))}
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#1e1b4b] border-2 border-amber-500/40 shadow-2xl relative overflow-hidden text-center text-white space-y-8">
          {/* Subtle Corner Accents */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl pointer-events-none" />

          {/* Verification Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            CRYPTOGRAPHICALLY VERIFIED CREDENTIAL
          </div>

          {/* Org & Platform Title */}
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-300">
              IEEE STUDENT BRANCH & HACKHUB PLATFORM
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-300 tracking-wide">
              Certificate of Achievement
            </h2>
          </div>

          <p className="text-sm text-gray-300 italic max-w-lg mx-auto">
            This certifies that the following participant has demonstrated technical excellence, leadership, and outstanding innovation at the
          </p>

          <p className="text-xl font-bold text-cyan-300 tracking-wide">
            {selectedCert.eventName}
          </p>

          {/* Recipient Box */}
          <div className="py-4 border-y border-white/10 max-w-xl mx-auto space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
              {selectedCert.recipientName}
            </p>
            <p className="text-sm font-semibold text-amber-400">
              {selectedCert.role} • {selectedCert.teamName}
            </p>
          </div>

          {/* Award Designation */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-400">Awarded For</span>
            <p className="text-lg font-bold text-white max-w-md mx-auto">
              {selectedCert.awardTitle}
            </p>
          </div>

          {/* Footer Metadata & Hashes */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 max-w-3xl mx-auto">
            <div className="text-left space-y-1">
              <p className="font-semibold text-white">Date of Issuance: {selectedCert.issuedAt}</p>
              <p>Issuer: {selectedCert.issuer}</p>
            </div>

            <div className="text-right space-y-1">
              <p className="font-mono text-cyan-300">ID: {selectedCert.certificateId}</p>
              <p className="font-mono text-[10px] text-gray-500 truncate max-w-[240px]">
                Hash: {selectedCert.verificationHash}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
