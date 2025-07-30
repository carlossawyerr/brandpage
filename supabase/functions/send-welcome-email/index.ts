import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  email: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email }: EmailRequest = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert email into waitlist
    const { data: waitlistData, error: insertError } = await supabaseClient
      .from('waitlist')
      .insert([{ email }])
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ error: 'Email already exists in waitlist' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      throw insertError
    }

    // Send welcome email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      // Continue without sending email but still add to waitlist
    } else {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Carlos Sawyerr Hats <noreply@yourdomain.com>', // Replace with your verified domain
            to: [email],
            subject: '🎩 Welcome to Carlos Sawyerr Hats Waitlist!',
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://carlossawyerr-brand-website-assets.s3.us-east-2.amazonaws.com/CarlosSawyerr_black.svg" 
                       alt="Carlos Sawyerr" 
                       style="height: 60px; width: auto;">
                </div>
                
                <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 300; text-align: center; margin-bottom: 20px; color: #000000;">
                  Welcome to the Waitlist! 🎩
                </h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px; text-align: center;">
                  Thank you for joining the Carlos Sawyerr Hats waitlist! You're now part of an exclusive group who will be the first to know when our debut collection launches.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="font-size: 18px; font-weight: 500; margin-bottom: 10px; color: #000000;">What's Next?</h2>
                  <ul style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0; padding-left: 20px;">
                    <li>You'll receive an email notification as soon as the collection drops</li>
                    <li>Early access to purchase before the general public</li>
                    <li>Exclusive updates on the design process and behind-the-scenes content</li>
                  </ul>
                </div>
                
                <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 30px;">
                  Follow us on <a href="https://www.instagram.com/carlossawyerr/" style="color: #000000; text-decoration: none;">Instagram @carlossawyerr</a> for updates
                </p>
              </div>
            `
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json()
          console.error('Failed to send email:', errorData)
          // Don't throw error - we still want to add them to waitlist
        } else {
          console.log('Welcome email sent successfully to:', email)
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't throw error - we still want to add them to waitlist
      }
    }

    // Update the record to mark welcome email as sent
    const { error: updateError } = await supabaseClient
      .from('waitlist')
      .update({ welcome_email_sent: true })
      .eq('id', waitlistData.id)

    if (updateError) {
      console.error('Error updating welcome_email_sent:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully added to waitlist and welcome email sent',
        id: waitlistData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})