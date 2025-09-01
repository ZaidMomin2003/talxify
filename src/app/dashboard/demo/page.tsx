
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Mic,
  Share2,
  CircleDotDashed,
  Presentation,
  BarChart,
  Users,
  Paperclip,
  Send,
  Bot,
  PhoneOff
} from "lucide-react";

interface Message {
  id: number;
  author: string;
  avatar: string;
  text: string;
  isSystem?: boolean;
}

const sampleMessages: Message[] = [
  { id: 1, author: 'Elwin Sharvill', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', text: 'Hey-hey! 👋' },
  { id: 2, author: 'Kita Chihiro', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', text: 'Hi everyone!' },
  { id: 3, author: 'Joseph', avatar: 'https://randomuser.me/api/portraits/men/33.jpg', text: 'Joseph here from California' },
  { id: 4, author: 'System', avatar: '', text: 'There will also be a recording available', isSystem: true },
  { id: 5, author: 'Gvozden Boskovsky', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', text: 'Hi everyone! Gvozden here from California 👋' },
];

export default function DemoPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);
  

  return (
    <main className="flex h-full w-full items-center justify-center bg-muted/30 p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-7xl">
        <div className="flex-1 flex flex-col gap-4">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between bg-card p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary"/>
                    <div>
                        <h1 className="font-bold text-lg">Engagement & Nurture Marketing Strategy</h1>
                        <p className="text-sm text-muted-foreground">Social Media Marketing</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <Video className="w-5 h-5"/>
                        <span className="sr-only">Cam</span>
                    </Button>
                    <Button variant="outline" size="icon">
                        <Mic className="w-5 h-5"/>
                        <span className="sr-only">Mic</span>
                    </Button>
                     <Button variant="destructive" size="icon">
                        <PhoneOff className="w-5 h-5"/>
                        <span className="sr-only">Leave</span>
                    </Button>
                </div>
            </header>

            {/* Video and Controls */}
            <div className="flex-grow bg-card rounded-lg border flex flex-col overflow-hidden relative">
               <div className="flex-grow bg-black flex items-center justify-center relative">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                  {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                        <Video className="w-16 h-16 mb-4"/>
                        <h2 className="text-xl font-bold">Camera is off</h2>
                        <p>Please grant camera access to start the video.</p>
                    </div>
                  )}
               </div>
            </div>
        </div>
      
        {/* Sidebar */}
        <aside className="w-full max-w-sm ml-4 bg-card rounded-lg border flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chat</h2>
            </div>
            <div className="flex-grow flex flex-col overflow-y-auto px-4 py-4 space-y-4">
                {/* Messages */}
                {sampleMessages.map((msg) => (
                    msg.isSystem ? (
                        <div key={msg.id} className="text-center">
                            <span className="bg-muted px-3 py-1 text-xs text-muted-foreground rounded-full">{msg.text}</span>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 border">
                                <AvatarImage src={msg.avatar} alt={msg.author} data-ai-hint="person avatar"/>
                                <AvatarFallback>{msg.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{msg.author}</p>
                                <div className="bg-muted p-2 rounded-lg text-sm text-muted-foreground mt-1">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </aside>
      </div>
    </main>
  );
}
