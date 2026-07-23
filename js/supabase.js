/*==================================================
        KHALSANA ES | Supabase Connection & DB
==================================================*/

const SUPABASE_URL = "https://bhqgrrjjgzikhbrzgkju.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*==============================
      إنشاء أو تحديث عميل
==============================*/
async function saveCustomer(data) {
    try {
        const { data: oldCustomer } = await supabase
            .from("customers")
            .select("*")
            .eq("phone", data.phone)
            .maybeSingle();

        if (oldCustomer) {
            await supabase
                .from("customers")
                .update({
                    name: data.name,
                    address: data.address,
                    updated_at: new Date()
                })
                .eq("id", oldCustomer.id);
            return oldCustomer.id;
        }

        const { data: newCustomer, error } = await supabase
            .from("customers")
            .insert({
                name: data.name,
                phone: data.phone,
                address: data.address
            })
            .select()
            .single();

        if (error) throw error;
        return newCustomer.id;
    } catch (err) {
        console.error("Customer Error:", err);
        return null;
    }
}

/*==============================
      حفظ طلب خدمة
==============================*/
async function saveServiceRequest(request) {
    try {
        const customerId = await saveCustomer({
            name: request.name,
            phone: request.phone,
            address: request.address
        });

        if (customerId == null) return false;

        const { error } = await supabase
            .from("service_requests")
            .insert({
                customer_id: customerId,
                service_type: request.service,
                estimated_price: request.price,
                notes: request.notes,
                status: "pending"
            });

        return !error;
    } catch (err) {
        console.error(err);
        return false;
    }
}

/*==============================
      زيادة عدادات الموقع
==============================*/
async function increaseCounter(type) {
    try {
        const { data, error } = await supabase
            .from("site_statistics")
            .select("*")
            .eq("id", 1)
            .single();

        if (error) {
            console.log(error);
            return;
        }

        let update = {};
        switch (type) {
            case "visits":
                update = { visits: (data.visits || 0) + 1 };
                break;
            case "calls":
                update = { calls: (data.calls || 0) + 1 };
                break;
            case "whatsapp":
                update = { whatsapp: (data.whatsapp || 0) + 1 };
                break;
            case "requests":
                update = { requests: (data.requests || 0) + 1 };
                break;
        }

        await supabase
            .from("site_statistics")
            .update(update)
            .eq("id", 1);
    } catch (err) {
        console.error(err);
    }
}

/*==============================
      تحميل الإحصائيات
==============================*/
async function loadSiteStatistics() {
    try {
        const { data, error } = await supabase
            .from("site_statistics")
            .select("*")
            .eq("id", 1)
            .single();

        if (error) {
            console.log(error);
            return null;
        }
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

/*==============================
      حفظ تقييم العميل
==============================*/
async function saveReview(review) {
    try {
        const customerId = await saveCustomer({
            name: review.name,
            phone: review.phone,
            address: ""
        });

        if (customerId == null) return false;

        const { error } = await supabase
            .from("reviews")
            .insert({
                customer_id: customerId,
                rating: review.rating,
                comment: review.comment
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// التصدير للنطاق العام لتجنب أخطاء النطاق
window.saveServiceRequest = saveServiceRequest;
window.increaseCounter = increaseCounter;
window.loadSiteStatistics = loadSiteStatistics;
window.saveReview = saveReview;
/*==============================
      تسجيل فني مع تعدد الخبرات
==============================*/
async function registerTechnicianWithExperiences(techData, experiencesList) {
    try {
        // 1. تسجيل البيانات الأساسية للفني
        const { data: newTech, error: techError } = await supabase
            .from("technicians")
            .insert({
                name: techData.name,
                phone: techData.phone,
                specialty: techData.specialty,
                area: techData.area,
                status: "pending"
            })
            .select()
            .single();

        if (techError) throw techError;

        const techId = newTech.id;

        // 2. إدخال سجلات الخبرات والأماكن المتعددة
        if (experiencesList && experiencesList.length > 0) {
            const expFormatted = experiencesList.map(exp => ({
                technician_id: techId,
                job_title: exp.jobTitle,
                workplace_name: exp.workplace,
                duration: exp.duration,
                description: ""
            }));

            const { error: expError } = await supabase
                .from("technician_experiences")
                .insert(expFormatted);

            if (expError) throw expError;
        }

        return true;
    } catch (err) {
        console.error("Tech & Experience Registration Error:", err);
        return false;
    }
}

window.registerTechnicianWithExperiences = registerTechnicianWithExperiences;
