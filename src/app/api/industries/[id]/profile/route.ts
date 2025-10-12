import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// GET - Fetch industry profile
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'INDUSTRY') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const industry = await db.industry.findUnique({
            where: { id: params.id },
        });

        if (!industry) {
            return NextResponse.json(
                { success: false, error: 'Industry not found' },
                { status: 404 }
            );
        }

        // Only allow viewing own profile
        if (industry.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: industry,
        });
    } catch (error) {
        console.error('GET /api/industries/[id]/profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update industry profile
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'INDUSTRY') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const industry = await db.industry.findUnique({
            where: { id: params.id },
        });

        if (!industry) {
            return NextResponse.json(
                { success: false, error: 'Industry not found' },
                { status: 404 }
            );
        }

        // Only allow updating own profile
        if (industry.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Validation schema
        const updateSchema = z.object({
            companyName: z.string().min(1, 'Company name is required'),
            industry: z.string().min(1, 'Industry field is required'),
            companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
            foundedYear: z.number().nullable().optional(),
            email: z.string().email().optional().or(z.literal('')),
            phone: z.string().optional(),
            websiteUrl: z.string().url().optional().or(z.literal('')),
            linkedinUrl: z.string().url().optional().or(z.literal('')),
            description: z.string().optional(),
            address: z.string().optional(),
            city: z.string().min(1, 'City is required'),
            state: z.string().min(1, 'State is required'),
            country: z.string().min(1, 'Country is required'),
        });

        const body = await request.json();
        const validatedData = updateSchema.parse(body);

        // Update industry profile
        const updatedIndustry = await db.industry.update({
            where: { id: params.id },
            data: {
                companyName: validatedData.companyName,
                industry: validatedData.industry,
                companySize: validatedData.companySize,
                foundedYear: validatedData.foundedYear,
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                websiteUrl: validatedData.websiteUrl || null,
                linkedinUrl: validatedData.linkedinUrl || null,
                description: validatedData.description || null,
                address: validatedData.address || null,
                city: validatedData.city,
                state: validatedData.state,
                country: validatedData.country,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedIndustry,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('PUT /api/industries/[id]/profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}