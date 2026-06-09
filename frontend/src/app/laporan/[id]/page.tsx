"use client";

import dynamic from "next/dynamic";

const DetailLaporanPublicClient = dynamic(
  () => import("../../../components/DetailLaporanPublicClient"),
  { ssr: false }
);

export default function LaporanDetailPage() {
  return <DetailLaporanPublicClient />;
}
