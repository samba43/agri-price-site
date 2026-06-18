const dbClient = window.supabase.createClient(
  'https://fiyumrqncvgwuczalgqc.supabase.co',
  'sb_publishable_XPNEWHWhX_tEMPKvGr63Qw_Ekm92Doz'
);

async function checkAdminAccess() {

    const {
        data: { user }
    } = await dbClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await dbClient
        .from("admins")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) {

        document.body.innerHTML = `
            <div style="padding:40px;text-align:center;">
                <h1>Access Denied</h1>
                <p>You are not an administrator.</p>
            </div>
        `;

        return;
    }

    document.getElementById("status").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
}

checkAdminAccess();