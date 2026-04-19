// src/components/About.jsx
import React from 'react'
import { 
    Target, 
    Eye, 
    Award, 
    Users, 
    TrendingUp, 
    Shield, 
    Zap,
    Clock,
    MapPin,
    Phone,
    Mail,
    ChevronRight
} from 'lucide-react'
import logo from '../assets/logo.svg'

const About = () => {
    // Données de l'entreprise
    const companyStats = [
        { 
            icon: Users, 
            value: '500+', 
            label: 'Clients satisfaits',
            color: 'primary'
        },
        { 
            icon: TrendingUp, 
            value: '15+', 
            label: 'Années d\'expérience',
            color: 'secondary'
        },
        { 
            icon: Award, 
            value: '50+', 
            label: 'Projets réalisés',
            color: 'accent'
        },
        { 
            icon: Shield, 
            value: '100%', 
            label: 'Sécurité garantie',
            color: 'info'
        }
    ]

    const values = [
        {
            icon: Target,
            title: 'Excellence',
            description: 'Nous visons l\'excellence dans chaque projet, en dépassant les attentes de nos clients.'
        },
        {
            icon: Eye,
            title: 'Innovation',
            description: 'Nous adoptons les dernières technologies pour offrir des solutions innovantes et durables.'
        },
        {
            icon: Zap,
            title: 'Réactivité',
            description: 'Notre équipe est disponible 24/7 pour répondre rapidement à vos besoins.'
        },
        {
            icon: Shield,
            title: 'Confiance',
            description: 'Nous construisons des relations durables basées sur la transparence et la confiance.'
        }
    ]

    const team = [
        {
            name: 'Jean Dupont',
            role: 'Directeur Général',
            image: 'https://via.placeholder.com/150',
            bio: 'Plus de 20 ans d\'expérience dans le secteur'
        },
        {
            name: 'Marie Martin',
            role: 'Directrice Commerciale',
            image: 'https://via.placeholder.com/150',
            bio: 'Experte en développement commercial'
        },
        {
            name: 'Pierre Dubois',
            role: 'Directeur Technique',
            image: 'https://via.placeholder.com/150',
            bio: 'Spécialiste en innovation technologique'
        }
    ]

    return (
        <div className="min-h-screen bg-base-200">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary to-primary-focus text-primary-content py-20 lg:py-28">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <img src={logo} alt="ECSI SARL" className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
                            À propos d'ECSI SARL
                        </h1>
                        <p className="text-lg lg:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                            Votre partenaire de confiance pour des solutions innovantes et durables. 
                            Nous combinons expertise technique et vision stratégique pour transformer vos défis en opportunités.
                        </p>
                    </div>
                </div>
                
                {/* Vague décorative */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-auto fill-base-200">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
                    </svg>
                </div>
            </section>

            {/* Statistiques */}
            <section className="py-16 -mt-10 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
                        {companyStats.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <div 
                                    key={index}
                                    className="stat bg-base-100 rounded-box shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="stat-figure text-primary">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="stat-title text-base-content/60">{stat.label}</div>
                                    <div className={`stat-value text-${stat.color} text-2xl lg:text-3xl`}>
                                        {stat.value}
                                    </div>
                                    <div className="stat-desc text-success text-sm">↗︎ En croissance</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Notre Histoire */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="lg:w-1/2">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-2">
                                        <div className="bg-base-100 rounded-2xl p-8 lg:p-12">
                                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                                                Notre Histoire
                                            </h2>
                                            <div className="space-y-4 text-base-content/80 leading-relaxed">
                                                <p>
                                                    Fondée en 2010, ECSI SARL est née de la vision de créer une entreprise 
                                                    qui allie expertise technique et service client d'excellence. Notre 
                                                    parcours a été marqué par une croissance constante et une adaptation 
                                                    continue aux évolutions du marché.
                                                </p>
                                                <p>
                                                    Aujourd'hui, nous sommes fiers d'être un acteur de référence dans 
                                                    notre secteur, reconnu pour notre capacité à innover et à délivrer 
                                                    des solutions sur mesure qui répondent aux besoins spécifiques de 
                                                    chaque client.
                                                </p>
                                            </div>
                                            
                                            <div className="mt-8 flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="badge badge-primary badge-lg">2010</div>
                                                    <span className="text-sm">Création</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="badge badge-secondary badge-lg">2015</div>
                                                    <span className="text-sm">Expansion nationale</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="badge badge-accent badge-lg">2020</div>
                                                    <span className="text-sm">Transformation digitale</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:w-1/2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="bg-primary/10 rounded-2xl p-6 h-40 flex items-center justify-center">
                                            <Users className="h-12 w-12 text-primary" />
                                        </div>
                                        <div className="bg-secondary/10 rounded-2xl p-6 h-32"></div>
                                    </div>
                                    <div className="space-y-4 pt-8">
                                        <div className="bg-accent/10 rounded-2xl p-6 h-32"></div>
                                        <div className="bg-info/10 rounded-2xl p-6 h-40 flex items-center justify-center">
                                            <Target className="h-12 w-12 text-info" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nos Valeurs */}
            <section className="py-16 lg:py-24 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nos Valeurs</h2>
                        <p className="text-base-content/60 max-w-2xl mx-auto">
                            Des principes qui guident chacune de nos actions et décisions
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {values.map((value, index) => {
                            const Icon = value.icon
                            return (
                                <div 
                                    key={index}
                                    className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="card-body items-center text-center p-6">
                                        <div className="bg-primary/10 rounded-full p-4 mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="card-title text-lg mb-2">{value.title}</h3>
                                        <p className="text-sm text-base-content/70">
                                            {value.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Notre Équipe */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Notre Équipe</h2>
                        <p className="text-base-content/60 max-w-2xl mx-auto">
                            Des experts passionnés à votre service
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {team.map((member, index) => (
                            <div key={index} className="card bg-base-100 shadow-xl">
                                <figure className="px-6 pt-6">
                                    <div className="avatar">
                                        <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            <img src={member.image} alt={member.name} />
                                        </div>
                                    </div>
                                </figure>
                                <div className="card-body items-center text-center">
                                    <h3 className="card-title">{member.name}</h3>
                                    <div className="badge badge-primary">{member.role}</div>
                                    <p className="text-sm text-base-content/70 mt-2">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-16 bg-base-300">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-base-100 rounded-3xl p-8 lg:p-12 shadow-xl">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 rounded-lg p-3">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Adresse</h4>
                                        <p className="text-sm text-base-content/70">
                                            123 Avenue des Champs-Élysées<br />
                                            75008 Paris, France
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-secondary/10 rounded-lg p-3">
                                        <Phone className="h-6 w-6 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Téléphone</h4>
                                        <p className="text-sm text-base-content/70">
                                            +33 1 23 45 67 89<br />
                                            +33 6 12 34 56 78
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-accent/10 rounded-lg p-3">
                                        <Mail className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Email</h4>
                                        <p className="text-sm text-base-content/70">
                                            contact@ecsi-sarl.fr<br />
                                            support@ecsi-sarl.fr
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="divider my-8"></div>
                            
                            <div className="text-center">
                                <h3 className="text-xl font-semibold mb-4">
                                    Prêt à collaborer avec nous ?
                                </h3>
                                <button className="btn btn-primary btn-wide">
                                    Contactez-nous
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-base-300 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-base-content/50">
                        © {new Date().getFullYear()} ECSI SARL – Tous droits réservés
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default About