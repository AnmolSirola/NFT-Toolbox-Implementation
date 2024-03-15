import { FirstA } from "@/components/component/FirstA";
import { Button } from "@/components/ui/button";

import React from "react";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <FirstA />
      <div className="flex justify-center">
        <Link href="/second">
          <Button size="lg" className="mx-4">
            Page B
          </Button>
        </Link>
        <Link href="/third">
          <Button size="lg" className="mx-4">
            Page C
          </Button>
        </Link>
      </div>
    </div>
  );
}
