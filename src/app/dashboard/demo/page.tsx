
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
  Power,
  PowerOff
} from "lucide-react";

interface Message {
  id: number;
  author: string;
  avatar: string;
  text: string;
}

const sampleMessages: Message[] = [
  { id: 1, author: 'Elwin Sharvill', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', text: 'Hey-hey! 👋' },
  { id: 2, author: 'Kita Chihiro', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', text: 'Hi everyone!' },
  { id: 3, author: 'Joseph', avatar: 'https://randomuser.me/api/portraits/men/33.jpg', text: 'Joseph here from California' },
  { id: 4, author: 'System', avatar: '', text: 'There will also be a recording available', isSystem: true } as any,
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
    <main className="flex h-screen w-full bg-muted/30 p-4">
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
                <Button variant="outline">Leave</Button>
                <Button>Finish the lesson</Button>
            </div>
        </header>

        {/* Video and Controls */}
        <div className="flex-grow bg-card rounded-lg border flex flex-col overflow-hidden relative">
           <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                LIVE 01:37:50
           </div>
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
           <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-t p-3 flex items-center justify-center gap-4">
                <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1">
                    <Video className="w-5 h-5"/>
                    <span className="text-xs">Cam</span>
                </Button>
                <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1">
                    <Mic className="w-5 h-5"/>
                    <span className="text-xs">Mic</span>
                </Button>
                <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1">
                    <Share2 className="w-5 h-5"/>
                    <span className="text-xs">Share</span>
                </Button>
                 <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1 text-destructive">
                    <CircleDotDashed className="w-5 h-5"/>
                    <span className="text-xs">Rec</span>
                </Button>
                <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1">
                    <Presentation className="w-5 h-5"/>
                    <span className="text-xs">Slides</span>
                </Button>
                <Button variant="outline" size="lg" className="flex flex-col h-auto p-3 gap-1">
                    <BarChart className="w-5 h-5"/>
                    <span className="text-xs">Poll</span>
                </Button>
           </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full max-w-sm ml-4 bg-card rounded-lg border flex flex-col">
        <Tabs defaultValue="chat" className="flex flex-col h-full">
            <TabsList className="m-2 grid w-auto grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="attendee">Attendee (12)</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-grow flex flex-col overflow-y-auto px-4 space-y-4">
                 {/* Poll */}
                 <Card className="p-4 bg-green-900/20 border-green-500/30 text-foreground">
                    <h3 className="font-semibold text-sm mb-3">Which platform will be the leader in your 2020 SMM strategy?</h3>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-xs mb-1"><span>Facebook</span><span>33%</span></div>
                            <Progress value={33} className="h-2 [&>div]:bg-green-500" />
                        </div>
                         <div>
                            <div className="flex justify-between text-xs mb-1"><span>Instagram</span><span>52%</span></div>
                            <Progress value={52} className="h-2 [&>div]:bg-green-500" />
                        </div>
                         <div>
                            <div className="flex justify-between text-xs mb-1"><span>Twitter</span><span>15%</span></div>
                            <Progress value={15} className="h-2 [&>div]:bg-green-500" />
                        </div>
                    </div>
                </Card>

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
            </TabsContent>
            <TabsContent value="attendee" className="flex-grow overflow-y-auto px-4">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Users className="w-8 h-8 mr-2"/> Attendee list would be here.
                </div>
            </TabsContent>
            {/* Message Input */}
            <div className="p-4 border-t mt-auto">
                <div className="relative">
                    <Input placeholder="Write your message..." className="pr-20" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon"><Send className="w-4 h-4"/></Button>
                    </div>
                </div>
            </div>
        </Tabs>
      </aside>
    </main>
  );
}
