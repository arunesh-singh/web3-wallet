"use client";

import { ToggleTheme } from "@/components/toogle-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardIcon, SunIcon } from "@radix-ui/react-icons";
import Image from "next/image";

import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath, getMasterKeyFromSeed } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { use, useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Wallet = {
  seed: string[];
  secret: string;
  publicKey: string;
};

export default function Home() {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [vault, setVault] = useState<Wallet[] | null>(null);

  // console.log("mnemonicWords: ", mnemonicWords);
  console.log("vault: ", vault);

  const generateWallet = useCallback((i: number) => {
    const mnemonic = generateMnemonic();

    setMnemonicWords(mnemonic.split(" "));
    const seed = mnemonicToSeedSync(mnemonic);

    const path = `m/44'/501'/${i}'/0'`;

    // from this derived seed we can get modified mnemonic
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

    const keypair = Keypair.fromSecretKey(secret);

    const privateKey = Buffer.from(keypair.secretKey).toString("base64");
    // console.log("privateKey: ", privateKey);
    const publicKey = keypair.publicKey.toBase58();

    setVault((prev) => [
      ...(prev || []),
      {
        seed: mnemonic.split(" "),
        secret: privateKey,
        publicKey: publicKey,
      },
    ]);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center py-24 md:px-64 lg:px-96 w-full">
      <nav className="sticky top-0 flex justify-between items-center w-full">
        <div className="flex item-center justify-center p-4 border rounded-full">
          <DashboardIcon className="h-[2rem] w-[2rem]  " />
        </div>
        <ToggleTheme />
      </nav>
      <section className="w-full space-y-4">
        <h1 className="text-[4rem] font-bold leading-10 mt-8">Wallet</h1>
        <h5 className="text-2xl ">
          A personal Web-3 Wallet for Harkirat&apos;s cohort 3.0 assignment.
        </h5>
        <div className="flex w-full gap-8">
          <Input
            placeholder="Enter your secret phrase (or leave black to generate)"
            className="w-full "
          />
          <Button
            onClick={() => generateWallet(0)}
            className="h-14 text-lg rounded-xl">
            Add Wallet
          </Button>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-8">
          {vault?.map((wallet, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>
                <h3 className="text-2xl font-bold">Wallet {i + 1}</h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2 ">
                    <h4 className="text-xl font-bold">Public Key</h4>
                    <h1 className="bg-background p-2 rounded-lg text-base">
                      {wallet.publicKey}
                    </h1>
                  </div>
                  <div className="space-y-2 ">
                    <h4 className="text-xl font-bold">Private Key</h4>
                    <p className="bg-background p-2 rounded-lg text-base break-normal">
                      {wallet.secret}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">Seed Phrase</h4>
                    <div className="grid gap-2 grid-cols-4 ">
                      {wallet.seed.map((word, i) => (
                        <div
                          key={i}
                          className="bg-background p-2 flex items-center justify-center rounded-lg">
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
