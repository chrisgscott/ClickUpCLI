# Tasks

## Plan Details Page

- Status: to test
- Priority: Not set
- ID: 868abp7wa

---

## Email Settings

- Status: in progress
- Priority: Not set
- ID: 868abp7yj

---

## Email Sending

- Status: in progress
- Priority: Not set
- ID: 868abp82u

---

## Brevo Integration

- Status: in progress
- Priority: Not set
- ID: 868abp839

---

## Brevo List

- Status: backlog
- Priority: Not set
- ID: 868abp84f

---

## Brevo Templates

- Status: backlog
- Priority: Not set
- ID: 868abp85m

---

## Brevo API Call

- Status: backlog
- Priority: Not set
- ID: 868abp874

---

## Plan Created Component

- Status: staged
- Priority: Not set
- ID: 868abp89r

---

## Onboarding Flow

- Status: in progress
- Priority: Not set
- ID: 868abp8ad

---

## Send Plan for Approval via Email

- Status: to test
- Priority: Not set
- ID: 868abp8bb

---

## Redirect "/" to Dashboard

- Status: staged
- Priority: Not set
- ID: 868abp8qd

---

## Add direct link to record in Stripe

- Status: backlog
- Priority: Not set
- ID: 868abp934

---

## Cancel Plan button

- Status: backlog
- Priority: Not set
- ID: 868abp96f

---

## Delete Plan button???

- Status: backlog
- Priority: Not set
- ID: 868abp97f

---

## Refund Payment button (in the transactions list)

- Status: backlog
- Priority: Not set
- ID: 868abp98u

---

## Payment Plans page

- Status: in progress
- Priority: Not set
- ID: 868abp9c0

---

## Choose displayed columns on PaymentPlansTable component

- Status: backlog
- Priority: Not set
- ID: 868abp9du

---

## Export all payment plans and transaction data to CSV

- Status: backlog
- Priority: Not set
- ID: 868abp9g4

---

## Create Payment Plan Flow

- Status: staged
- Priority: Not set
- ID: 868abp9jn

---

## Add order details or attach an invoice to a plan

- Status: staged
- Priority: Not set
- ID: 868abp9m7

---

## Reports

- Status: backlog
- Priority: Not set
- ID: 868abp9n4

---

## Admin Area

- Status: planned
- Priority: Not set
- ID: 868abp9pj

---

## Integrations

Direct integrations with:
CRM software
Bookkeeping software
Sales software

- Status: backlog
- Priority: Not set
- ID: 868abp9qv

---

## Client Portal

Give the customer an online portal to be able to:
Approve, reject, request changes to payment plans
View upcoming payments
See all plan details
Update credit card details
Modify payment schedule (within a specified range?)
View attached documents?

- Status: backlog
- Priority: Not set
- ID: 868abp9z7

---

## Update Card button

- Status: to test
- Priority: Not set
- ID: 868abpa3h

---

## Update Payment Schedule button

- Status: planned
- Priority: Not set
- ID: 868abpa5f

---

## Plan Details Component

- Status: staged
- Priority: Not set
- ID: 868abpb27

---

## Payment Schedule Component

- Status: staged
- Priority: Not set
- ID: 868abpb34

---

## Payment Details Component

- Status: staged
- Priority: Not set
- ID: 868abpb44

---

## Payment Plan Templates

Common payment plan settings saved for quick reuse. Ex: wedding photographer has 4 core packages, create a template for each package and just start from the template.

- Status: backlog
- Priority: Not set
- ID: 868abpbur

---

## Dashboard

- Status: in progress
- Priority: Not set
- ID: 868abpenn

---

## Settings Page

- Status: in progress
- Priority: Not set
- ID: 868abpf9f

---

## Profile Settings

- Status: in progress
- Priority: Not set
- ID: 868abpfj9

---

## Stripe Settings

- Status: in progress
- Priority: Not set
- ID: 868abpfk1

---

## Backend

- Status: in progress
- Priority: Not set
- ID: 868abpfvh

---

## Update Account Creds

- Status: to test
- Priority: Not set
- ID: 868abpmd4

---

## Update Profile Information

- Status: to test
- Priority: Not set
- ID: 868abpmht

---

## Delete Account

- Status: to test
- Priority: Not set
- ID: 868abpmm2

---

## Disconnect Stripe Account

- Status: to test
- Priority: Not set
- ID: 868abpmuc

---

## Reconnect Stripe Account

- Status: to test
- Priority: Not set
- ID: 868abpmw8

---

## Email templates

- Status: backlog
- Priority: Not set
- ID: 868abpn6z

---

## Notification Preferences

Allow the user to toggle notifications from PayKit on things like:
CC me on all client emails
New plan created
Payment collected
Payment failed
Payment plan complete
Payment plan canceled
Payment plan deleted
New payout scheduled
Payout complete

- Status: backlog
- Priority: Not set
- ID: 868abpna9

---

## Dashboard Widgets

- Status: in progress
- Priority: Not set
- ID: 868abppky

---

## Recent Activity

- Status: backlog
- Priority: Not set
- ID: 868abppta

---

## Error notifications for backend jobs

Objective
We need to be notified when backend jobs fail.  
Software Requirements
Ensure all jobs are fully wrapped in a try / catch block
This catch should email a new jobs@paykit.io email if it fails
Note that this should be configurable by environment, so we can specify which email address to send to
Dev can be dev.jobs@paykit.io
Local would be our own personal emails for testing
Supabase Optional Requirements
Supabase may have job monitoring and notifications built in.  If they do, we should leverage this as a secondary guard.  We don't want to get stuck with vendor lock-in, so we still want to send our own emails.

- Status: hardening
- Priority: Not set
- ID: 868abzp7f

---

## Harden Payment Processing Job to Prevent Duplicate Charges

Description
The file supastripe/supabase/functions/process-due-payments/index.ts has a weakness in it where the job COULD create a PaymentIntent in Stripe but then fail to update the database.  This would result in a second attempt at the same transaction and a duplicate PaymentIntent to be created.
Requirements
On line 47 we see this:
  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(transaction.amount * 100), // amount in cents
    currency: 'usd',
    customer: customer.stripe_customer_id,
    metadata: {
      transaction_id: transaction.id,
      payment_plan_id: transaction.payment_plan_id,
    },
  })

  // Update the transaction with the PaymentIntent ID
  await supabase
    .from('transactions')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', transaction.id)
This needs to be hardened to prevent the PaymentIntent from being created more than once.  A suggestion would be:

Add a new DB field to the transaction table called "IS_PROCESSING"; it can be a BOOLEAN
For each transaction:
Check IS_PROCESSING
If TRUE
Check Stripe for a payment intent with this transaction ID
If one exists:
we've already charged, do nothing and proceed to the below logic
If one does NOT exist:
Create a PaymentIntent.  We attempted to create the PaymentIntent but something failed
If FALSE
Create a PaymentIntent
Update the transaction status to DONE an set IS_PROCESSING to FALSE

- Status: hardening
- Priority: Not set
- ID: 868abzvd7

---

## Harden Payment Processing Job for performance purposes

We're currently selecting ALL payment plans that are due.  We may want to limit this to batches of 100 by simply adding a WHERE clause.  This job could then run every 15 minutes and it will happily stay on top of the load for a long time.

If we end up very popular and do 1000 jobs in a day, we could exceed the runtime limit and have the job be killed, leaving us in a potentially icky place.

 Updated to follow a very similar approach to  . Both are currently set to run once an hour, which should be hella sufficient for a while, I'd think. If we get to the point where we're running more than 2400 transactions a day, I'll be a happy man. And we'll probably have someone else running this shit at that point.   

// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Stripe } from 'https://esm.sh/stripe@12.18.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
)

const MAX_RECORDS_PER_EXECUTION = 100;

serve(async (req: Request) => {
  console.log('Function started');

  try {
    const currentDate = new Date().toISOString().split('T')[0];

    // Get due transactions
    const { data: dueTransactions, error } = await supabase
      .from('transactions')
      .select('*, payment_plans(user_id, customer_id)')
      .eq('status', 'pending')
      .lte('due_date', currentDate)
      .limit(MAX_RECORDS_PER_EXECUTION);

    if (error) throw error;

    console.log(`Found ${dueTransactions?.length || 0} due transactions to process`);

    const results = await Promise.allSettled(dueTransactions.map(async (transaction) => {
      const idempotencyKey = `process_payment_${transaction.id}_${currentDate}`;

      // Check if this transaction has already been processed today
      const { data: existingLog } = await supabase
        .from('payment_processing_logs')
        .select()
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingLog) {
        console.log(`Transaction ${transaction.id} already processed today`);
        return;
      }

      try {
        // Get the customer's payment method
        const { data: customer } = await supabase
          .from('customers')
          .select('stripe_customer_id')
          .eq('id', transaction.payment_plans.customer_id)
          .single();

        if (!customer?.stripe_customer_id) {
          throw new Error(`No Stripe customer found for customer ID: ${transaction.payment_plans.customer_id}`);
        }

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: transaction.amount,
          currency: 'usd',
          customer: customer.stripe_customer_id,
          metadata: {
            transaction_id: transaction.id,
            payment_plan_id: transaction.payment_plan_id,
          },
        });

        // Update the transaction with the PaymentIntent ID
        await supabase
          .from('transactions')
          .update({ 
            stripe_payment_intent_id: paymentIntent.id,
            status: 'processing'
          })
          .eq('id', transaction.id);

        // Log the successful processing attempt
        await supabase
          .from('payment_processing_logs')
          .insert({
            transaction_id: transaction.id,
            status: 'success',
            stripe_payment_intent_id: paymentIntent.id,
            idempotency_key: idempotencyKey
          });

        console.log(`Created PaymentIntent ${paymentIntent.id} for transaction ${transaction.id}`);
      } catch (err) {
        console.error(`Error processing transaction ${transaction.id}:`, err);

        // Log the failed processing attempt
        await supabase
          .from('payment_processing_logs')
          .insert({
            transaction_id: transaction.id,
            status: 'failed',
            error_message: err.message,
            idempotency_key: idempotencyKey
          });
      }
    }));

    // Count successful and failed payment processing attempts
    const failedCount = results.filter(result => result.status === 'rejected').length;
    const successCount = results.length - failedCount;

    // Check if there are more records to process
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('due_date', currentDate);

    if (countError) {
      console.error('Error getting total count:', countError);
    }

    const hasMoreRecords = (count || 0) > dueTransactions.length;

    // Return the results
    return new Response(JSON.stringify({ 
      message: 'Due payments processed',
      successCount,
      failedCount,
      processedCount: dueTransactions.length,
      hasMoreRecords
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

- Status: hardening
- Priority: Not set
- ID: 868abzy6y

---

## Verify Database COMMIT process

We need to confirm if the database is committing after every statement, or if it is running in a transaction.  If it's transaction, that will change some of the logic on our jobs to ensure we don't end up in a wonky state.

- Status: hardening
- Priority: Not set
- ID: 868ac03ty

---

## Harden Sending Payment Emails

Description
In send-payment-reminder-emails/index.ts we have a similar problem to .  We can end up in a state where we've sent the email but the DB update fails and we may sen duplicate emails.
Requirements
I'd suggest a similar solution to :

Add a new IS_SENDING_EMAIL field to the Transactions table (BOOLEAN)
Update the transaction first to say "IS_SENDING_EMAIL" and set it to TRUE
Then if it's TRUE and we try to send another email, we may want to use a separate template that says "Hey we may have sent you an email already, but we wanted to be sure you got notified"
Then update the transaction like currently but set IS_SENDING_EMAIL to false

 Here's the updated file. gg?
// @ts-nocheck

// Import necessary dependencies
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import type { Request } from 'https://deno.land/std@0.168.0/http/server.ts'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const brevoApiKey = Deno.env.get('BREVO_API_KEY') as string

// Define the Transaction interface
interface Transaction {
  id: string;
  amount: number;
  due_date: string;
  payment_plans: {
    user_id: string;
    customers: {
      name: string;
      email: string;
    };
  };
  business_info?: {
    business_name: string;
    support_email: string;
    support_phone: string;
  };
}

// Function to send a payment reminder email using Brevo API
async function sendPaymentReminderEmail(
  recipientEmail: string,
  params: {
    customer_name: string;
    amount: number;
    due_date: string;
    business_name: string;
    support_email: string;
    support_phone: string;
  }
): Promise<boolean> {
  try {
    // Send email using Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        to: [{ email: recipientEmail }],
        templateId: 1,
        params: params
      })
    });

    // Check if the API request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from Brevo API:', errorData);
      return false;
    }

    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Main function to handle the HTTP request
serve(async (req: Request) => {
  console.log('Function started');
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Fetching transactions');
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Fetch pending transactions that need reminder emails
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        due_date,
        payment_plans!inner(
          user_id,
          customers(name, email)
        )
      `)
      .eq('status', 'pending')
      .eq('reminder_email_date', currentDate)
      .is('last_reminder_email_log_id', null)
      .limit(MAX_RECORDS_PER_EXECUTION);

    if (error) {
      console.error('Error fetching transactions:', error);
      return new Response(JSON.stringify({ error: 'Error fetching transactions' }), { status: 500 });
    }

    console.log(`Found ${transactions?.length || 0} transactions to process`);

    // Process each transaction concurrently
    const results = await Promise.allSettled(transactions.map(async (transaction) => {
      // Create a unique idempotency key for this email attempt
      const idempotencyKey = `payment_reminder_${transaction.id}_${currentDate}`;

      // Check if an email has already been sent for this transaction today
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select()
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingLog) {
        console.log(`Email already processed for transaction ${transaction.id}`);
        return;
      }

      // Fetch business profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('business_name, support_email, support_phone')
        .eq('id', transaction.payment_plans.user_id)
        .single();

      if (profileError) {
        console.error(`Error fetching profile data for user ID ${transaction.payment_plans.user_id}:`, profileError);
        return;
      }

      // Prepare email parameters
      const emailParams = {
        customer_name: transaction.payment_plans.customers.name,
        amount: Number((transaction.amount / 100).toFixed(2)), // Round to 2 decimal places
        due_date: transaction.due_date,
        business_name: profileData.business_name,
        support_email: profileData.support_email,
        support_phone: profileData.support_phone
      };

      // Attempt to send email with retries
      let retries = 3;
      while (retries > 0) {
        try {
          const success = await sendPaymentReminderEmail(
            transaction.payment_plans.customers.email,
            emailParams
          );

          // Prepare log data
          const logData = {
            email_type: 'payment_reminder',
            recipient_email: transaction.payment_plans.customers.email,
            status: success ? 'sent' : 'failed',
            related_id: transaction.id,
            related_type: 'transaction',
            idempotency_key: idempotencyKey
          };

          // Log the email attempt
          const { data, error: logError } = await supabase
            .from('email_logs')
            .insert(logData)
            .select()
            .single();

          if (logError) {
            throw logError;
          }

          if (success) {
            // Update the transaction with the email log ID
            await supabase
              .from('transactions')
              .update({ last_reminder_email_log_id: data.id })
              .eq('id', transaction.id);

            console.log(`Successfully sent reminder email for transaction ${transaction.id}`);
            return;
          }
        } catch (error) {
          console.error(`Error sending email for transaction ${transaction.id}:`, error);
          retries--;
          if (retries === 0) {
            // Log the final failed attempt
            await supabase
              .from('email_logs')
              .insert({
                email_type: 'payment_reminder',
                recipient_email: transaction.payment_plans.customers.email,
                status: 'failed',
                error_message: error.message,
                related_id: transaction.id,
                related_type: 'transaction',
                idempotency_key: idempotencyKey
              });
          }
        }
      }
    }));

    // Count successful and failed email sends
    const failedCount = results.filter(result => result.status === 'rejected').length;
    const successCount = results.length - failedCount;

    // Check if there are more records to process
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('reminder_email_date', currentDate)
      .is('last_reminder_email_log_id', null);

    if (countError) {
      console.error('Error getting total count:', countError);
    }

    const hasMoreRecords = (count || 0) > transactions.length;

    // Return the results
    return new Response(JSON.stringify({ 
      message: 'Reminder emails processed',
      successCount,
      failedCount,
      processedCount: transactions.length,
      hasMoreRecords
    }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), { status: 500 });
  }
});

const MAX_RECORDS_PER_EXECUTION = 100; // Adjust this number as needed

- Status: hardening
- Priority: Not set
- ID: 868ac066x

---

## Harden Front End Errors

Description
If an error occurs in the API, the front end simply says "There was an error loading Payment Plans" (note that this is not limited to PaymetPlans; anywhere an API call fails we need to harden).   This needs to give the user some better details about what happened and what to do.
Requirements
Improve the language to tell the user that nothing is scary, all is well
Offer a refresh button to manually refresh or tell the user to reload the page

- Status: hardening
- Priority: Not set
- ID: 868ac0846

---

## Change Stripe Webhook Handling

Description
See sub tasks for specific issues
This is in a job, but shouldn't it be in the API as Stripe needs to hit our webhook endpoint?

- Status: bug
- Priority: Not set
- ID: 868ac09zx

---

## Change the status return code on failure

Any error should be returned as a 500 not a 400

- Status: backlog
- Priority: Not set
- ID: 868ac0ea3

---

## Improve error handling for unknown transaction ID

if we have a transaction come in from Stripe but no known Transaction ID in our system, that should send us an email, not just return a failure to Stripe

This is a big WTF scenario

- Status: backlog
- Priority: Not set
- ID: 868ac0eec

---

## Improve handlePaymentIntentSucceeded

Why are we not setting the Payment Plan to active as soon as it is created?  Once the plan is approved it's active, regardless if they have made a payment yet

Note, if we drop this requirement, then we don't need to fix this:
This whole thing needs wrapped in a transaction with the Database (see )
You do NOT want a few transactions completed and others not.  The whole thing needs to start a transaction and after the very last DB command is executed, it should commit the entire transaction.  This will ensure it all completes

- Status: backlog
- Priority: Not set
- ID: 868ac0eg9

---

## Improve handlePaymentIntentFailed

This one may require some conversation.

How many attempts do we have before we fully fail?
We need to track the attempts in the DB an the attempt count so we can take action based off of that
Why isn't this notifying anyone of the failure?
We need to understand what caused the error
Depending on the error, like the Card was Declined, that's different than wrong address on file sort of thing.  We will need to make decisions on what to do based off of the error condition
Why do we update the plan to failed on the first failure?  I think we want a backoff process where the first one fails, sends out a notice that it failed, and that we'll need X more tries

- Status: backlog
- Priority: Not set
- ID: 868ac0ehf

---

## Discuss Reviews

I didn't see anything in the web code for reviews; is this a feature we're offering?  We're storing it in the DB and handling the event.

I also don't see it handled in the switch on line 36, so review notifications will fail...

- Status: backlog
- Priority: Not set
- ID: 868ac0j25

---

## Discuss Payouts

I think we need to show all of the payouts to the user in a Payouts page, not just the dashboard.  Note that this probably becomes a task of its own as a feature request, but making sure I start with this in the Stripe Webhook handler.

I also don't see it handled in the switch on line 36, so payout notifications will fail...

- Status: backlog
- Priority: Not set
- ID: 868ac0jt1

---

## Discuss Transfers

I don't really understand the transfers or how it would work via the UI...

- Status: backlog
- Priority: Not set
- ID: 868ac0mta

---

## Payment Plan Creation is buggy

In Safari, MacOS 18, I went through the steps to create a payment plan.  When I got to the payment details section, the screen stuttered a bit before the CC fields popped in.  

You may need to do a delayed display until it fully loads.

- Status: bug
- Priority: Not set
- ID: 868ac0p8n

---

## Dashboard hover icon is jank

See screenshot.  I'm sure whatever is in the white box is nice and helpful.  I just can't see it!

- Status: bug
- Priority: Not set
- ID: 868ac0pvd

---

## Improve password updating

They should have to enter the current password to update their password to something else.  It's a small, but necessary, added layer of security.

- Status: hardening
- Priority: Not set
- ID: 868ac0tjv

---

## Discuss user management

I see that supabase auth supports different auth methods (see here).  We may want to ad some of those to further improve our handling.

NOTE: if we do, we need to hide the password update feature.

- Status: hardening
- Priority: Not set
- ID: 868ac0u0t

---

## Improve Stripe view of settings

- Status: hardening
- Priority: Not set
- ID: 868ac0wg2

---

## Change email templates

I'd make these all the DEFAULT templates for now.  Users can't edit it, but we can note that a future release will add that ability with an improved subscription plan or something like that.

- Status: hardening
- Priority: Not set
- ID: 868ac0x45

---

## Missing Logout button

How the heck do I log out?????

Also, how long am I logged in for...?  I see that supabase auth should handle RefreshTokens and all that jazz, so hopefully if you let it sit for long enough it will auto log you out, but if you're using the app it won't log you out.

- Status: to test
- Priority: Not set
- ID: 868ac0xu7

---

## Payment Plan creating doubled

I started creating a payment plan for "Spock", but didn't get all the way through.  Somehow, it created 2 payment plans...

I think the backend is too aggressively creating it in the DB and it needs to save all of that info in the frontend until the user okays the plan.

- Status: bug
- Priority: Not set
- ID: 868ac0ywv

---

## "Update Payment Plan" button is broken

This appears to happen on the Spock plan that I never fully finished setting up.  It also happens on the plan Chris made for Cyrus.

- Status: bug
- Priority: Not set
- ID: 868ac11pn

---

## Status icon needs to be capitalized on the Payment Plan view

- Status: staged
- Priority: Not set
- ID: 868ac12y2

---

## Improve loading view on updating the CC

It currently says "Loading..." and is left aligned.  I like a spinner, but at the very least, I'd add more padding and center the message.

- Status: hardening
- Priority: Not set
- ID: 868ac13nt

---

## Discuss recent emails sent to customer

I naturally wanted to see WHAT you sent to the customer, but I can't click into those emails and view them.  It may be a good idea to store what we're actually sending out so you can click and view what was sent to the customer and when.

I don't know what we're using yet for the email, but some email services would let us download the raw payload.  That's probably overkill IMO.

- Status: hardening
- Priority: Not set
- ID: 868ac14kk

---

## Admin Section

We will probably want to flesh out what all we want to see here.  A few things would be:

Ability to possess a user
This way we don't have to monkey with admin views for all of their data
Ability to override plans
Not sure if we need this if we possess a user, but having an all powerful zone could be nice
Roll up details
Amount we've made
Number of active plans
Number of users
Others?

- Status: backlog
- Priority: Not set
- ID: 868ac16ew

---

## Added a handle_successful_payment database function

CREATE OR REPLACE FUNCTION handle_successful_payment(p_transaction_id UUID, p_paid_at TIMESTAMP WITH TIME ZONE)
RETURNS JSON AS $$
DECLARE
  v_payment_plan_id UUID;
  v_count INT;
BEGIN
  -- Start transaction
  BEGIN
    -- Update transaction status
    UPDATE transactions
    SET status = 'paid', paid_at = p_paid_at
    WHERE id = p_transaction_id
    RETURNING payment_plan_id INTO v_payment_plan_id;

    -- Check if this is the first paid transaction for the payment plan
    SELECT COUNT(*) INTO v_count
    FROM transactions
    WHERE payment_plan_id = v_payment_plan_id AND status = 'paid';

    -- If this is the first paid transaction, update the payment plan status to 'active'
    IF v_count = 1 THEN
      UPDATE payment_plans
      SET status = 'active'
      WHERE id = v_payment_plan_id;
    END IF;

    -- Commit transaction
    RETURN json_build_object('success', true);
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback transaction
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;


This works alongside our updated update-payment-status edge function:

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Stripe } from 'https://esm.sh/stripe@12.18.0'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  Deno.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found in the request');
    return new Response('No signature', { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  try {
    const body = await req.text();
    console.log('Received webhook body:', body);

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret
    );

    console.log(`Received webhook event: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      case 'transfer.created':
        await handleTransfer(event.data.object as Stripe.Transfer, supabase);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    clearTimeout(timeoutId);
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: 'Error processing webhook', details: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Handling successful PaymentIntent:', paymentIntent);

  const transactionId = paymentIntent.metadata.transaction_id;

  if (!transactionId) {
    console.error('No transaction ID found in metadata:', paymentIntent.metadata);
    throw new Error('No transaction ID found in metadata');
  }

  console.log(`Processing successful payment for transaction ${transactionId}`);

  const { data, error } = await supabase.rpc('handle_successful_payment', {
    p_transaction_id: transactionId,
    p_paid_at: new Date().toISOString()
  });

  if (error) {
    console.error(`Error processing successful payment for transaction ${transactionId}:`, error);
    throw error;
  }

  console.log(`Successfully processed payment for transaction ${transactionId}`, data);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const transactionId = paymentIntent.metadata.transaction_id

  if (!transactionId) {
    throw new Error('No transaction ID found in metadata')
  }

  console.log(`Processing failed payment for transaction ${transactionId}`)

  const { error: updateError } = await supabase
    .from('transactions')
    .update({ 
      status: 'failed',
      next_attempt_date: paymentIntent.next_payment_attempt 
        ? new Date(paymentIntent.next_payment_attempt * 1000).toISOString() 
        : null
    })
    .eq('id', transactionId)

  if (updateError) {
    console.error(`Error updating transaction ${transactionId}:`, updateError)
    throw updateError
  }

  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('payment_plan_id')
    .eq('id', transactionId)
    .single()

  if (fetchError) {
    console.error(`Error fetching transaction ${transactionId}:`, fetchError)
    throw fetchError
  }

  const { error: planUpdateError } = await supabase
    .from('payment_plans')
    .update({ status: 'failed' })
    .eq('id', transaction.payment_plan_id)

  if (planUpdateError) {
    console.error(`Error updating payment plan ${transaction.payment_plan_id}:`, planUpdateError)
    throw planUpdateError
  }

  console.log(`Successfully processed failed payment for transaction ${transactionId}`)
}

async function handleAccountUpdated(account: Stripe.Account, supabase: any) {
  console.log(`Updating account ${account.id}`)

  const { error: stripeAccountError } = await supabase
    .from('stripe_accounts')
    .update({
      stripe_onboarding_completed: account.details_submitted,
      stripe_account_details_url: `https://dashboard.stripe.com/${account.id}`,
    })
    .eq('stripe_account_id', account.id)

  if (stripeAccountError) {
    console.error(`Error updating stripe_accounts for account ${account.id}:`, stripeAccountError)
    throw stripeAccountError
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      business_name: account.business_profile?.name || null,
      business_url: account.business_profile?.url || null,
      support_phone: account.business_profile?.support_phone || null,
      support_email: account.business_profile?.support_email || account.email || null,
      is_onboarded: account.details_submitted,
    })
    .eq('stripe_account_id', account.id)

  if (profileError) {
    console.error(`Error updating profiles for account ${account.id}:`, profileError)
    throw profileError
  }

  console.log(`Successfully updated account ${account.id}`)
}

async function handlePayout(payout: Stripe.Payout, supabase: any, connectedAccountId: string) {
  console.log(`Processing payout ${payout.id} for account ${connectedAccountId}`)

  const { error: upsertError } = await supabase
    .from('payouts')
    .upsert({
      stripe_payout_id: payout.id,
      stripe_account_id: connectedAccountId,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
    })

  if (upsertError) {
    console.error(`Error upserting payout ${payout.id}:`, upsertError)
    throw upsertError
  }

  console.log(`Successfully processed payout ${payout.id}`)
}

async function handleReview(review: Stripe.Review, supabase: any, connectedAccountId: string) {
  console.log(`Processing review ${review.id} for account ${connectedAccountId}`)

  const { error: upsertError } = await supabase
    .from('stripe_reviews')
    .upsert({
      stripe_review_id: review.id,
      stripe_account_id: connectedAccountId,
      reason: review.reason,
      status: review.closed ? 'closed' : 'open',
      opened_at: new Date(review.created * 1000).toISOString(),
      closed_at: review.closed ? new Date(review.closed * 1000).toISOString() : null,
    })

  if (upsertError) {
    console.error(`Error upserting review ${review.id}:`, upsertError)
    throw upsertError
  }

  console.log(`Successfully processed review ${review.id}`)
}

async function handleTransfer(transfer: Stripe.Transfer, supabase: any) {
  const transactionId = transfer.metadata.transaction_id

  if (!transactionId) {
    throw new Error('No transaction ID found in transfer metadata')
  }

  console.log(`Processing transfer ${transfer.id} for transaction ${transactionId}`)

  const { error: updateError } = await supabase
    .from('transactions')
    .update({ 
      stripe_transfer_id: transfer.id,
      transfer_amount: transfer.amount / 100
    })
    .eq('id', transactionId)

  if (updateError) {
    console.error(`Error updating transaction ${transactionId} with transfer information:`, updateError)
    throw updateError
  }

  console.log(`Successfully processed transfer ${transfer.id}`)
}

- Status: backlog
- Priority: Not set
- ID: 868acbtb8

---

## Implement Payment Retry Strategy

Design and implement a comprehensive payment retry strategy for failed payments:

1. Retry Schedule:
- Implement exponential backoff (1 day, 3 days, 7 days)
- Maximum 3 retry attempts
- Configurable retry intervals

2. Features:
- Automatic retry scheduling
- Notification to customer before each retry
- Merchant dashboard for retry status
- Manual retry trigger option

3. Error Handling:
- Track retry attempt count
- Log retry outcomes
- Handle permanent failures

4. Monitoring:
- Retry success rate metrics
- Average recovery time
- Failed payment analysis

- Status: in progress
- Priority: urgent
- ID: 868azt2n1

---

## Implement Customer Notification System

Design and implement a comprehensive notification system for payment plans:

1. Notification Types:
- Payment plan creation
- Payment success
- Payment failure
- Retry attempt scheduled
- Payment plan completion
- Card expiration warning

2. Features:
- Email template system
- Customizable notification content
- Merchant branding options
- Notification preferences
- Click tracking

3. Implementation:
- Email service integration
- Template management system
- Notification queue
- Delivery status tracking

4. Monitoring:
- Delivery success rates
- Open/click rates
- Notification logs
- Performance metrics

- Status: planned
- Priority: high
- ID: 868azt2t6

---

## Enhanced Dashboard Analytics

Implement enhanced analytics and reporting features in the merchant dashboard:

1. Payment Plan Metrics:
- Success rate by plan type
- Average completion time
- Early payment statistics
- Default rate analysis

2. Financial Analytics:
- Revenue forecasting
- Cash flow projections
- Transaction fee analysis
- Refund rate tracking

3. Customer Insights:
- Payment method preferences
- Geographic distribution
- Customer retention metrics
- Payment timing patterns

4. Performance Monitoring:
- API response times
- Error rate tracking
- System uptime metrics
- Integration health checks

- Status: backlog
- Priority: normal
- ID: 868azt2w9

---

## Implement Error Recovery and Rollback System

Design and implement a comprehensive error recovery system for payment processing:

1. Transaction Rollback:
- Atomic operations for payment processing
- Compensation transactions for partial failures
- State reconciliation with Stripe

2. Error Classification:
- Transient vs. permanent failures
- Network issues vs. validation errors
- Stripe-specific error handling

3. Recovery Strategies:
- Automatic recovery for transient failures
- Manual intervention triggers
- Data consistency checks

4. Monitoring:
- Error recovery success rate
- Average recovery time
- Failed recovery analysis

Technical Implementation:
- Use database transactions
- Implement idempotency keys
- Add detailed error logging
- Create recovery audit trail

- Status: planned
- Priority: urgent
- ID: 868azt43p

---

## Implement Merchant Settings and Customization

Add merchant-specific settings and customization options:

1. Branding Settings:
- Custom email templates
- Logo and color scheme
- Payment page customization
- Receipt customization

2. Payment Plan Settings:
- Default payment intervals
- Minimum/maximum payment amounts
- Custom payment schedules
- Late payment grace periods

3. Notification Settings:
- Email notification preferences
- Custom notification rules
- Notification templates
- Language preferences

4. Integration Settings:
- Webhook configurations
- API key management
- Callback URLs
- Error notification preferences

Technical Implementation:
- Create settings database schema
- Add settings management UI
- Implement settings validation
- Add settings cache layer

- Status: backlog
- Priority: high
- ID: 868azt5hw

---

## Implement Developer Tools for Error Testing

Create developer tools for testing error scenarios and recovery:

1. Error Simulation:
- Payment failure simulation
- Network error simulation
- State inconsistency simulation
- Webhook failure simulation

2. State Inspection:
- Payment plan state viewer
- State transition history
- Stripe state comparison
- Recovery attempt logs

3. Testing Framework:
- Error scenario test cases
- Recovery flow testing
- Performance impact testing
- Integration test helpers

4. Monitoring Tools:
- Real-time error tracking
- Recovery success metrics
- Performance impact analysis
- Error pattern detection

Technical Implementation:
- Create testing API endpoints
- Build developer dashboard
- Implement test data generators
- Add monitoring interfaces

- Status: backlog
- Priority: normal
- ID: 868azt5y9

---

## Implement Preview Mode

Create a restricted preview mode that allows users to explore and set up their account while waiting for Stripe verification

- Status: planned
- Priority: Not set
- ID: 868azuy1g

---

## Add Preview Mode UI Indicators

Implement clear visual indicators showing preview mode status and which features will be unlocked after verification

- Status: planned
- Priority: Not set
- ID: 868azuy2u

---

## Implement Draft Payment Plans

Allow users to create and save draft payment plans that will activate upon verification

- Status: planned
- Priority: Not set
- ID: 868azuy7u

---

## Enhanced Verification Status Tracking

Implement comprehensive verification status tracking and notification system

- Status: planned
- Priority: Not set
- ID: 868azuy88

---

## Implement Stripe Webhooks

Set up webhook listeners for Stripe account.updated events to track verification status changes

- Status: planned
- Priority: Not set
- ID: 868azuy8u

---

## Create Verification Dashboard

Build a detailed verification status dashboard showing current stage, pending requirements, and estimated completion time

- Status: planned
- Priority: Not set
- ID: 868azuy92

---

## Implement Guided Setup Process

Create a guided setup process for non-Stripe dependent tasks to keep users engaged during verification

- Status: planned
- Priority: Not set
- ID: 868azuy9h

---

## Create Business Profile Setup

Implement business profile setup flow including branding, team members, and preferences

- Status: planned
- Priority: Not set
- ID: 868azuya2

---

## Implement Educational Content System

Create a system for delivering getting started guides, tutorials, and best practices during the waiting period

- Status: planned
- Priority: Not set
- ID: 868azuyhw

---

## Implement Communication Strategy

Set up automated communication system for verification updates, timeline estimates, and support contact

- Status: planned
- Priority: Not set
- ID: 868azuyxf

---

## Future ClickUp Organization System

Comprehensive task organization system for future implementation as the project scales:

STATUS STRUCTURE:
1. Planning Phase
   - idea (Initial concepts)
   - speccing (Being designed)
   - ready (Ready for development)

2. Development Phase
   - blocked (Has dependencies)
   - in progress
   - review (Code review)
   - qa (Testing)
   - done

3. Support Track
   - bug
   - critical
   - investigating

LABEL CATEGORIES:
1. Area (frontend, backend, etc)
2. Feature Category (onboarding, payments, etc)
3. Impact Type (UX, performance, etc)
4. Release Planning (mvp, v1.0, etc)
5. Effort/Complexity
6. Customer Impact
7. Priority Markers
8. Special Handling
9. Business Value
10. Technical Categories

Full details and subcategories in task comments.

- Status: backlog
- Priority: Not set
- ID: 868azv26y

---

## Implement user authentication

Add OAuth2 authentication flow for users

- Status: backlog
- Priority: normal
- ID: 868azx3pd

---

## Fix mobile layout issues

Address responsive design problems on small screens

- Status: in progress
- Priority: urgent
- ID: 868azx3ph

---

## Add export functionality

Allow users to export data in CSV format

- Status: backlog
- Priority: normal
- ID: 868azx3pp

---

## Implement user authentication

Add OAuth2 authentication flow for users

- Status: backlog
- Priority: normal
- ID: 868azx48y

---

## Fix mobile layout issues

Address responsive design problems on small screens

- Status: in progress
- Priority: urgent
- ID: 868azx49b

---

## Add export functionality

Allow users to export data in CSV format

- Status: backlog
- Priority: normal
- ID: 868azx49v

---

## Implement user authentication

Add OAuth2 authentication flow for users

- Status: backlog
- Priority: normal
- ID: 868azx4n4

---

## Fix mobile layout issues

Address responsive design problems on small screens

- Status: in progress
- Priority: urgent
- ID: 868azx4n8

---

## Add export functionality

Allow users to export data in CSV format

- Status: backlog
- Priority: normal
- ID: 868azx4nd

---

## Implement user authentication

Add OAuth2 authentication flow for users

- Status: backlog
- Priority: normal
- ID: 868azx5jz

---

## Fix mobile layout issues

Address responsive design problems on small screens

- Status: in progress
- Priority: urgent
- ID: 868azx5k6

---

