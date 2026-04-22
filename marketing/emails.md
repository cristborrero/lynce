# Email Sequences for LYNCE

## 1. Welcome Email (After Signup)
**Subject:** Welcome to the shield, {{name}} 🛡️

Hi {{name}},

Thanks for joining LYNCE! We're thrilled to help you secure your WordPress sites. 

As a new member, you've unlocked:
- Detailed vulnerability scans
- Security header validation
- Sensitive file detection

**Quick Action:** Why not run your first authenticated scan now?
[Go to Dashboard](https://lynce.io/dashboard)

Stay secure,
The LYNCE Team

---

## 2. Scan Complete (Guest or User)
**Subject:** Your Security Report for {{url}} is Ready

Hi there,

We just finished scanning **{{url}}**. 

**Your Security Score: {{score}}/100**

You can view the full report and remediation steps here:
[View Report](https://lynce.io/results/{{scan_id}})

*Pro tip: Users on our Pro plan can download these reports as white-labeled PDFs to share with clients.*

---

## 3. Upgrade Prompt (Low Score / Free Limit)
**Subject:** Don't leave {{url}} unprotected

Hi {{name}},

Your latest scan for **{{url}}** flagged some critical vulnerabilities. While the basic report gives you a head start, our **Pro Plan** includes:

- **Automated Monitoring:** We scan your site every 24h and alert you via Slack/Email if something changes.
- **Client Reports:** Beautiful PDFs you can send directly to your customers.
- **API Access:** Integrate LYNCE into your own CI/CD pipelines.

[Upgrade to Pro — Save 20% on Annual](https://lynce.io/pricing)

Shield up,
LYNCE
