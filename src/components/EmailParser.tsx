import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const EmailParser = () => {
  const [emailInput, setEmailInput] = useState("");
  const [parsedResult, setParsedResult] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Advanced email parser function that handles various email formats
  const parseEmail = (emailText: string) => {
    if (!emailText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter or upload an email to parse.",
        variant: "destructive",
      });
      return null;
    }
    
    // Initialize result object
    const result: Record<string, string> = {};
    
    // Step 1: Try to extract standard email headers if present
    const headerPatterns = {
      subject: /Subject:(.+?)(?:\r?\n)/i,
      from: /From:(.+?)(?:\r?\n)/i,
      to: /To:(.+?)(?:\r?\n)/i,
      date: /Date:(.+?)(?:\r?\n)/i,
      cc: /Cc:(.+?)(?:\r?\n)/i,
      bcc: /Bcc:(.+?)(?:\r?\n)/i,
      replyTo: /Reply-To:(.+?)(?:\r?\n)/i,
      messageId: /Message-ID:(.+?)(?:\r?\n)/i,
    };

    // Extract header information if available
    Object.entries(headerPatterns).forEach(([key, pattern]) => {
      const match = emailText.match(pattern);
      if (match && match[1]) {
        result[key] = match[1].trim();
      } else {
        result[key] = "Not found";
      }
    });

    // Step 2: Extract all email addresses from the content
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const allEmailAddresses = [...new Set(emailText.match(emailRegex) || [])];
    
    // If standard headers didn't work, try to identify sender/recipient from context
    if (result.from === "Not found" && allEmailAddresses.length > 0) {
      // Try to detect sender based on common patterns
      const possibleSenderPatterns = [
        /from[\s:]+([\w.-]+@[\w.-]+\.\w+)/i,
        /([\w.-]+@[\w.-]+\.\w+)[\s\n]+sent/i,
        /by[\s:]+([\w.-]+@[\w.-]+\.\w+)/i
      ];
      
      for (const pattern of possibleSenderPatterns) {
        const match = emailText.match(pattern);
        if (match && match[1]) {
          result["from"] = match[1];
          break;
        }
      }
      
      // If still not found, use the first email in the list as a fallback
      if (result.from === "Not found") {
        result["from"] = allEmailAddresses[0];
      }
    }

    // Step 3: Extract URLs from the email
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const urls = emailText.match(urlPattern) || [];
    result["urls"] = urls.length > 0 ? urls.join(", ") : "No URLs found";
    
    // Step 4: List all email addresses found
    result["emailAddresses"] = allEmailAddresses.length > 0 ? 
      allEmailAddresses.join(", ") : 
      "No email addresses found";

    // Step 5: Try to extract the body of the email
    // First try the standard approach for emails with headers
    let body = "";
    const bodyPattern = /\r?\n\r?\n([\s\S]*)/;
    const bodyMatch = emailText.match(bodyPattern);
    
    if (bodyMatch && bodyMatch[1]) {
      body = bodyMatch[1].trim();
    } else {
      // For emails without clear header separation, use the full text
      body = emailText;
    }
    
    // If we couldn't extract specific headers but found a full body,
    // try to extract a subject line from the first line
    if (result.subject === "Not found" && body) {
      const lines = body.split(/\r?\n/);
      if (lines.length > 0 && lines[0].length < 200) { // Reasonable subject line length
        result["subject"] = lines[0];
      }
    }
    
    result["body"] = body.length > 500 ? body.substring(0, 500) + "..." : body;
    
    // Step 6: Try to detect email type/purpose
    if (emailText.toLowerCase().includes("unsubscribe") || 
        emailText.toLowerCase().includes("newsletter") ||
        emailText.toLowerCase().includes("subscription")) {
      result["type"] = "Newsletter/Promotional";
    } else if (emailText.toLowerCase().includes("invoice") || 
               emailText.toLowerCase().includes("payment") ||
               emailText.toLowerCase().includes("receipt")) {
      result["type"] = "Transaction/Receipt";
    } else if (emailText.toLowerCase().includes("confirm") || 
               emailText.toLowerCase().includes("verification") ||
               emailText.toLowerCase().includes("activate")) {
      result["type"] = "Account Verification";
    } else if (emailText.toLowerCase().includes("password") || 
               emailText.toLowerCase().includes("reset") ||
               emailText.toLowerCase().includes("security")) {
      result["type"] = "Security/Password Reset";
    } else {
      result["type"] = "Standard Communication";
    }
    
    // Step 7: Try to extract a greeting or recipient name
    const greetingPattern = /(dear|hello|hi|hey)\s+([^\s,\.]+)/i;
    const greetingMatch = emailText.match(greetingPattern);
    if (greetingMatch && greetingMatch[2]) {
      result["greeting"] = greetingMatch[0];
      
      // If we found a name in greeting and don't have recipient info, suggest it
      if (result.to === "Not found") {
        result["possibleRecipient"] = greetingMatch[2];
      }
    }

    // Step 8: Look for action items or key information
    if (emailText.toLowerCase().includes("code:") || 
        emailText.toLowerCase().includes("confirmation code")) {
      const codePattern = /code:?\s*([a-zA-Z0-9]{4,8})/i;
      const codeMatch = emailText.match(codePattern);
      if (codeMatch && codeMatch[1]) {
        result["verificationCode"] = codeMatch[1];
      }
    }

    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setEmailInput(content || "");
      // Clear the file input
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleParseClick = () => {
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      const result = parseEmail(emailInput);
      setParsedResult(result);
      setIsLoading(false);
      
      if (result) {
        toast({
          title: "Email Parsed Successfully",
          description: "We've extracted the key information from your email.",
        });
      }
    }, 1000);
  };

  const handleSampleEmail = () => {
    // Keep the existing sample email code
    const sampleEmail = `From: raufpokemon00@icloud.com
To: icreativez.tasks.tracker@gmail.com
Subject: Today Task Report
Date: Tue, 29 Apr 2025 05:00 pm
Cc: muhammadkamran@gmail.com
Reply-To: raufpokemon00@icloud.com

Name: Abdul Rauf Jatoi
Branch: Nawabshah Branch
City: Nawabshah
Department: Frontend Development

Task:
Today, I finalized and submitted my Multilingual Chatbot task. This chatbot can communicate in multiple languages, analyze uploaded files, search for information (such as temperature when asked), and scrape a website if a link is provided. I also integrated it with a website and WhatsApp, as instructed by the task giver. I shared screenshots and a screen recording video as proof.
However, the WhatsApp integration was later turned off because the Meta Developer account was rejected for business purposes; they require payment if multiple numbers are to be shared, and they also require a business card or SIM. Despite this, I demonstrated the integration successfully.

Now, my team lead Muhammad Kamran has assigned me a new task: Email Parser. I have already created the frontend for it using React/Vite. Below are the screenshots of my work:
`;
    setEmailInput(sampleEmail);
  };

  const handleFacebookSampleEmail = () => {
    // Add a Facebook-style email sample
    const facebookSample = `Hi Abdul Rauf,

You recently added raufpokemon00@gmail.com to your Facebook account.

Please confirm this email address so that we can update your contact information. You may be asked to enter this confirmation code:

FB-*****`;
    setEmailInput(facebookSample);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg text-center text-gray-700">Upload or paste your email text to parse important information</p>
        </div>
        
        {/* Email Input Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <label 
                  htmlFor="email-upload" 
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer btn-transition"
                >
                  <Upload size={18} />
                  <span>Upload Email File</span>
                  <input
                    id="email-upload"
                    type="file"
                    accept=".txt,.eml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-500 hidden sm:inline">or</span>
                <span className="text-gray-500 block sm:hidden w-full text-center">or use sample</span>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    onClick={handleSampleEmail}
                    className="text-primary border-primary/20 hover:bg-primary/10 w-full sm:w-auto"
                  >
                    Standard Email
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleFacebookSampleEmail}
                    className="text-primary border-primary/20 hover:bg-primary/10 w-full sm:w-auto"
                  >
                    Facebook Email
                  </Button>
                </div>
              </div>
              
              <Textarea
                className="min-h-[200px] resize-y border-primary/20 focus:border-primary"
                placeholder="Paste email content here..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              
              <div className="text-center pt-2">
                <Button 
                  onClick={handleParseClick}
                  className="bg-primary hover:bg-primary/90 text-white hover-scale"
                  disabled={isLoading || !emailInput.trim()}
                >
                  {isLoading ? "Parsing..." : "Parse Email"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Section */}
        {parsedResult && (
          <Card className="shadow-md animate-fade-in border-primary/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 text-primary">Parsed Results</h3>
              <div className="grid gap-3">
                {Object.entries(parsedResult).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 items-center border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-700 capitalize">{key}:</span>
                    <span className="col-span-2 text-gray-600 break-words">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailParser;
